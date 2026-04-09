import { describe, expect, it } from "vitest";
import { buildPublicFormUrl, upsertForm } from "@/lib/formsUi";
import type { FormRecord } from "@/lib/formsApi";

const mkForm = (patch: Partial<FormRecord>): FormRecord => ({
  id: "f1",
  user_id: "u1",
  name: "Demo Form",
  slug: "demo-form",
  category: "Lead",
  description: null,
  schema_json: { fields: [] },
  style_json: {},
  status: "draft",
  published: false,
  published_at: null,
  created_at: "2026-04-09T00:00:00.000Z",
  updated_at: "2026-04-09T00:00:00.000Z",
  ...patch,
});

describe("formsUi helpers", () => {
  it("builds public form URL only for published forms with slug", () => {
    const origin = "http://localhost:8081";
    expect(buildPublicFormUrl(origin, mkForm({ published: false, slug: "a" }))).toBeNull();
    expect(buildPublicFormUrl(origin, mkForm({ published: true, slug: "" }))).toBeNull();
    expect(buildPublicFormUrl(origin, mkForm({ published: true, slug: "contact-us" }))).toBe("http://localhost:8081/forms/contact-us");
  });

  it("upserts form and keeps updated form first", () => {
    const forms = [mkForm({ id: "f1", name: "Old" }), mkForm({ id: "f2", name: "Other" })];
    const updated = mkForm({ id: "f1", name: "New" });
    const created = mkForm({ id: "f3", name: "Created" });

    const afterUpdate = upsertForm(forms, updated);
    expect(afterUpdate[0].id).toBe("f1");
    expect(afterUpdate[0].name).toBe("New");
    expect(afterUpdate).toHaveLength(2);

    const afterCreate = upsertForm(afterUpdate, created);
    expect(afterCreate[0].id).toBe("f3");
    expect(afterCreate).toHaveLength(3);
  });
});
