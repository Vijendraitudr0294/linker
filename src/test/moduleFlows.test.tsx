import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", async () => {
  const { supabaseMock } = await vi.importActual<typeof import("@/integrations/supabase/local_client")>(
    "@/integrations/supabase/local_client"
  );

  return {
    supabase: supabaseMock,
    isSupabaseConfigured: false,
    isUsingSupabaseMock: true,
  };
});

import { supabase } from "@/integrations/supabase/client";
import {
  createForm,
  getPublicForm,
  listFormSubmissions,
  listMyForms,
  publishForm,
  submitPublicForm,
  updateForm,
} from "@/lib/formsApi";
import { useQRCodes, useQRForgeMutations } from "@/hooks/useQRForgeApi";
import { usePublicProfileQuery } from "@/hooks/usePublicProfile";
import { useAppearanceStore } from "@/stores/appearanceStore";

const createQueryWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const resetMockTables = (...tableNames: string[]) => {
  tableNames.forEach((tableName) => {
    window.localStorage.setItem(`db_${tableName}`, "[]");
  });
};

const signInMockUser = async (email: string) => {
  await supabase.auth.signOut();
  await supabase.auth.signInWithPassword({ email, password: "test-password" });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  expect(user?.id).toBeTruthy();

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  expect(profile).toBeTruthy();

  return {
    userId: user!.id,
    username: profile.username as string,
  };
};

describe("module smoke flows", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    useAppearanceStore.setState({ loading: false, settingsFetched: false } as never);
    await supabase.auth.signOut();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates and reads QR codes for the authenticated user", async () => {
    window.localStorage.setItem("qrforge_codes", "[]");
    const { userId } = await signInMockUser("qr-smoke@example.com");

    const wrapper = createQueryWrapper();
    const { result: mutationResult } = renderHook(() => useQRForgeMutations(userId), {
      wrapper,
    });

    await act(async () => {
      await mutationResult.current.addQRCode.mutateAsync({
        name: "Smoke QR",
        type: "url",
        mode: "dynamic",
        content: "https://example.com",
        fg_color: "#000000",
        bg_color: "#ffffff",
        logo_url: null,
        is_active: true,
      });
    });

    const { result: queryResult } = renderHook(() => useQRCodes(userId), { wrapper });

    await waitFor(() => expect(queryResult.current.isSuccess).toBe(true));
    expect(queryResult.current.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: userId,
          name: "Smoke QR",
          content: "https://example.com",
          mode: "dynamic",
        }),
      ])
    );
    expect(queryResult.current.data?.[0]?.short_code).toBeTruthy();
  });

  it("creates, updates, publishes, and accepts submissions for survey forms", async () => {
    resetMockTables("forms", "form_submissions", "form_uploads");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("backend unavailable"));
    const { userId } = await signInMockUser("forms-smoke@example.com");

    const created = await createForm({
      name: "Smoke Survey",
      category: "Feedback",
      description: "A quick verification survey",
      fields: [
        {
          id: "field_email",
          type: "email",
          label: "Email",
          required: true,
          placeholder: "name@example.com",
        },
      ],
    });

    expect(created.user_id).toBe(userId);
    expect(created.status).toBe("draft");

    const updated = await updateForm(created.id, {
      name: "Smoke Survey Updated",
      category: "Feedback",
      description: "Updated survey description",
      fields: [
        {
          id: "field_email",
          type: "email",
          label: "Email",
          required: true,
          placeholder: "name@example.com",
        },
        {
          id: "field_feedback",
          type: "long_text",
          label: "Feedback",
          required: true,
          placeholder: "Tell us what you think",
        },
      ],
    });

    expect(updated.name).toBe("Smoke Survey Updated");
    expect(updated.schema_json.fields).toHaveLength(2);

    const forms = await listMyForms();
    expect(forms.some((form) => form.id === created.id)).toBe(true);

    const published = await publishForm(created.id);
    expect(published.published).toBe(true);
    expect(published.status).toBe("published");
    expect(published.slug).toBeTruthy();

    const publicForm = await getPublicForm(published.slug);
    expect(publicForm.form.id).toBe(created.id);
    expect(publicForm.form.name).toBe("Smoke Survey Updated");

    const submissionResult = await submitPublicForm(published.slug, {
      field_email: "hello@example.com",
      field_feedback: "Everything works",
    });

    expect(submissionResult).toHaveProperty("submission.id");

    const submissions = await listFormSubmissions(created.id);
    expect(submissions).toHaveLength(1);
    expect(submissions[0]?.payload).toMatchObject({
      field_email: "hello@example.com",
      field_feedback: "Everything works",
    });

    fetchSpy.mockRestore();
  });

  it("persists profile-builder appearance changes and exposes them on the public profile query", async () => {
    resetMockTables("appearance_settings", "links", "catalog_items");
    const { userId, username } = await signInMockUser("profile-builder@example.com");

    await (supabase as any).from("links").insert({
      user_id: userId,
      title: "Portfolio",
      url: "https://example.com/portfolio",
      platform: "website",
      enabled: true,
      sort_order: 0,
    });

    useAppearanceStore.setState({ loading: false, settingsFetched: false } as never);
    await useAppearanceStore.getState().fetchSettings(userId);
    await useAppearanceStore.getState().updateSettings({
      backgroundColor: "#123456",
      buttonBg: "#fedcba",
      linksTabLabel: "Connect",
      layoutType: "grid",
    });

    const { result } = renderHook(() => usePublicProfileQuery(username), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.profileData.username).toBe(username);
    expect(result.current.data?.appearanceData?.background_color).toBe("#123456");
    expect(result.current.data?.appearanceData?.button_bg).toBe("#fedcba");
    expect(result.current.data?.appearanceData?.links_tab_label).toBe("Connect");
    expect(result.current.data?.appearanceData?.layout_type).toBe("grid");
    expect(result.current.data?.linksData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Portfolio",
          url: "https://example.com/portfolio",
        }),
      ])
    );
  });
});
