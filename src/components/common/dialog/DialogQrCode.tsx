import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScanQrCode } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DialogDescription } from '@radix-ui/react-dialog';

export const DialogQrCode = ({ treeId }: { treeId: string }) => {
  const [qr, setQr] = useState<string>('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return; // hanya generate saat dibuka

    const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL(treeId, {
          width: 800,
          margin: 2,
          color: {
            dark: '#335383FF',
            light: '#EEEEEEFF',
          },
        });
        setQr(url);
      } catch (err) {
        console.error(err);
      }
    };

    generateQRCode();
  }, [open, treeId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <ScanQrCode className="w-4 h-4 text-cyan-500 cursor-pointer" />
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>QR Code</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code dari Pohon</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {qr ? (
          <div className="flex flex-col items-center gap-2">
            <img src={qr} alt="QR Code" className="w-64 h-64" />
            <div className="space-y-1 text-center">
              <p className="text-sm text-slate-700">ID Pohon: {treeId}</p>
              <p className="text-base text-slate-800">atau</p>
              <p className="text-sm text-slate-700">Scan QR Code ini untuk mengambil ID Pohon</p>
            </div>
            <a
              href={qr}
              download={`tree-${treeId}.png`}
              className="text-blue-500 text-lg underline font-semibold"
            >
              Download
            </a>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">Membuat QR Code...</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
