import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, Copy, Download, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface CatalogQRCodeModalProps {
  username: string;
  servicesUrl: string;
}

export function CatalogQRCodeModal({ username, servicesUrl }: CatalogQRCodeModalProps) {
  const handleDownloadPNG = () => {
    const svg = document.querySelector("#qr-code-container svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 440;
    canvas.height = 440;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `${username}-qr-code.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const svg = document.querySelector("#qr-code-container")?.innerHTML || "";
    printWindow.document.write(`
      <html><head><title>QR Code - ${username}</title>
      <style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif}
      .container{text-align:center;padding:40px}p{font-size:14px;color:#666;margin-top:16px}</style></head>
      <body><div class="container">${svg}<p>Scan to view catalog · BIOTRA.com/p/${username}/services</p></div></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <QrCode className="w-4 h-4" /> QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" /> Services QR Code
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="p-6 bg-white rounded-2xl shadow-lg" id="qr-code-container">
            <QRCodeSVG
              value={servicesUrl}
              size={220}
              level="H"
              includeMargin
              fgColor="#1a1a1a"
              bgColor="#ffffff"
            />
            <p className="text-center text-xs text-gray-500 mt-3 font-medium">
              Scan to view {username}'s catalog
            </p>
          </div>
          <div className="flex items-center gap-2 w-full">
            <Input value={servicesUrl} readOnly className="text-xs" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(servicesUrl);
                toast.success("Link copied!");
              }}
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadPNG}>
              <Download className="w-3.5 h-3.5 mr-1" /> Download PNG
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5 mr-1" /> Print
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Print this QR code and display it at your store, gym, or restaurant. Customers can scan it to see your full menu/services.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
