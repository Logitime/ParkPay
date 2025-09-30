
'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Camera, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { saveSnapshot } from '@/app/actions';
import { format } from 'date-fns';

export function CameraFeed({ gateName, captureTrigger, imageFileName }: { gateName: string, captureTrigger?: number, imageFileName?: string | null }) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async (isAuto: boolean = false) => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      
      // Use the provided imageFileName (ticket ID) if available, otherwise generate a timestamped one for manual captures
      const fileName = imageFileName ? `${imageFileName}.jpg` : `${gateName.replace(/\s+/g, '_')}-${format(new Date(), 'yyyyMMdd-HHmmss')}.jpg`;

      const result = await saveSnapshot({ imageDataUrl, fileName });

      if (result.success) {
        toast({
          title: isAuto ? 'Auto Snapshot Captured' : 'Snapshot Captured',
          description: `Image saved as ${fileName} (simulated).`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Capture Failed',
          description: result.message,
        });
      }
    }
    setIsCapturing(false);
  };
  
  useEffect(() => {
    if (captureTrigger && captureTrigger > 0) {
      handleCapture(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captureTrigger]);


  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();

    // Cleanup function to stop the video stream when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Camera className="size-5" />
            <CardTitle className="text-lg">CCTV Feed: {gateName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden relative">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
           <canvas ref={canvasRef} className="hidden" />

          {hasCameraPermission === null && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Initializing camera...</p>
             </div>
          )}
        </div>
        {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser settings to use this feature.
              </AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
            className="w-full" 
            onClick={() => handleCapture(false)}
            disabled={!hasCameraPermission || isCapturing}
        >
            {isCapturing ? <Loader2 className="mr-2 animate-spin" /> : <Video className="mr-2" />}
            {isCapturing ? 'Capturing...' : 'Capture Snapshot'}
        </Button>
      </CardFooter>
    </Card>
  );
}
