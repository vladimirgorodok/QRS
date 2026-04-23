import QRCode from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useRef } from "react";

interface QRGeneratorProps {
  profileId: string;
  profileName: string;
}

export const QRGenerator = ({ profileId, profileName }: QRGeneratorProps) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const viewUrl = `${window.location.origin}/view/${profileId}`;

  const handleDownloadPNG = () => {
    const canvas = qrRef.current?.querySelector("canvas") as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${profileName}-qr-code.png`;
      link.click();
    }
  };

  const handleDownloadSVG = () => {
    const svg = qrRef.current?.querySelector("svg") as SVGElement;
    if (svg) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${profileName}-qr-code.svg`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(viewUrl);
  };

  return (
    <div className="space-y-6">
      {/* QR Code Display */}
      <div className="bg-white rounded-xl border border-border p-8 flex justify-center">
        <div ref={qrRef} className="bg-white p-4 rounded-lg">
          <QRCode
            value={viewUrl}
            size={256}
            level="H"
            includeMargin={true}
            quietZone={10}
            renderAs="svg"
          />
        </div>
      </div>

      {/* View URL */}
      <div className="bg-slate-50 rounded-xl p-4 border border-border">
        <p className="text-sm text-muted-foreground mb-2">View URL:</p>
        <p className="text-sm font-mono text-foreground break-all">{viewUrl}</p>
      </div>

      {/* Download & Share Options */}
      <div className="space-y-3">
        <Button
          onClick={handleDownloadPNG}
          variant="outline"
          className="w-full gap-2"
        >
          <Download className="w-4 h-4" />
          Download as PNG
        </Button>
        <Button
          onClick={handleDownloadSVG}
          variant="outline"
          className="w-full gap-2"
        >
          <Download className="w-4 h-4" />
          Download as SVG
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="secondary"
          className="w-full gap-2"
        >
          Copy View Link
        </Button>
      </div>
    </div>
  );
};
