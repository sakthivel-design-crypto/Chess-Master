import React, { useState, useRef, useEffect } from "react";
import { 
  X, Upload, Camera, Image as ImageIcon, ZoomIn, ZoomOut, Move, RotateCcw, Check, Trash2, Sparkles, User, AlertCircle 
} from "lucide-react";
import { PRESET_AVATARS, UserAvatar } from "./UserAvatar";
import { motion, AnimatePresence } from "motion/react";

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string | null;
  username: string;
  onSaveImage: (newImageDataUrl: string | null) => void;
}

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  isOpen,
  onClose,
  currentImage,
  username,
  onSaveImage
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "camera" | "avatars">("upload");
  const [selectedRawImage, setSelectedRawImage] = useState<string | null>(null);
  const [selectedAvatarSvg, setSelectedAvatarSvg] = useState<string | null>(null);

  // Zoom & Pan state for cropper
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera Management
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: "user" } 
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Webcam access error:", err);
      setCameraError("Camera access disabled or unavailable. Please use file upload.");
      setIsCameraActive(false);
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setSelectedRawImage(dataUrl);
      setSelectedAvatarSvg(null);
      stopCamera();
      setActiveTab("upload");
    }
  };

  // Reset states on open/close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setSelectedRawImage(null);
      setSelectedAvatarSvg(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Handle File Upload from Gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      alert("Please upload a valid JPG, JPEG, or PNG image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedRawImage(event.target.result as string);
        setSelectedAvatarSvg(null);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedRawImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Crop & Downscale to 256x256 square compressed image data URL
  const handleSaveAndCrop = () => {
    if (selectedAvatarSvg) {
      onSaveImage(selectedAvatarSvg);
      onClose();
      return;
    }

    if (selectedRawImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#0B0D17";
          ctx.fillRect(0, 0, size, size);

          // Draw cropped circular image according to zoom & pan
          const minDim = Math.min(img.width, img.height);
          const drawWidth = (img.width / minDim) * size * zoom;
          const drawHeight = (img.height / minDim) * size * zoom;

          const offsetX = (size - drawWidth) / 2 + (pan.x / 200) * size;
          const offsetY = (size - drawHeight) / 2 + (pan.y / 200) * size;

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          const finalDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          onSaveImage(finalDataUrl);
          onClose();
        }
      };
      img.src = selectedRawImage;
      return;
    }

    // Default save
    onClose();
  };

  const handleRemovePicture = () => {
    onSaveImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg rounded-3xl bg-[#0B0D17] border border-amber-500/30 shadow-2xl p-6 text-white space-y-5 overflow-hidden"
      >
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-500/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold font-serif text-white">Profile Picture</h3>
              <p className="text-xs text-amber-200/60 font-mono">Personalize your ChessZen avatar</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
          <button
            onClick={() => {
              stopCamera();
              setActiveTab("upload");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "upload"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="h-3.5 w-3.5" /> Gallery Upload
          </button>
          <button
            onClick={() => {
              setActiveTab("camera");
              startCamera();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "camera"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Camera className="h-3.5 w-3.5" /> Take Photo
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab("avatars");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "avatars"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" /> Preset Avatars
          </button>
        </div>

        {/* TAB 1: GALLERY UPLOAD & CROP */}
        {activeTab === "upload" && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedRawImage && !selectedAvatarSvg ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-500/30 hover:border-amber-400/60 rounded-3xl p-8 text-center cursor-pointer bg-slate-950/40 hover:bg-amber-500/5 transition-all space-y-3 group"
              >
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white font-serif">Upload Image from Gallery</div>
                  <div className="text-xs text-slate-400 mt-1">Supports JPG, JPEG, or PNG (Max 10MB)</div>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer">
                  Select File
                </button>
              </div>
            ) : (
              /* CROPPER / EDITOR VIEW */
              <div className="space-y-4">
                <div className="text-center font-bold text-xs text-amber-300 font-mono uppercase tracking-wider">
                  Drag to Reposition & Adjust Zoom
                </div>

                <div className="flex justify-center">
                  <div
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-amber-500/60 shadow-2xl bg-slate-950 cursor-grab active:cursor-grabbing select-none"
                  >
                    {selectedAvatarSvg ? (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: selectedAvatarSvg }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                          transition: isDragging ? "none" : "transform 0.1s ease-out"
                        }}
                      >
                        <img
                          src={selectedRawImage!}
                          alt="Crop Preview"
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 pointer-events-none" />
                  </div>
                </div>

                {selectedRawImage && (
                  <div className="space-y-2 max-w-xs mx-auto">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span className="flex items-center gap-1">
                        <ZoomOut className="h-3.5 w-3.5" /> Zoom
                      </span>
                      <span>{Math.round(zoom * 100)}%</span>
                      <ZoomIn className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />

                    <div className="flex justify-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setZoom(1);
                          setPan({ x: 0, y: 0 });
                        }}
                        className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" /> Reset View
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="h-3 w-3" /> Replace Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TAKE PHOTO (WEBCAM / CAMERA) */}
        {activeTab === "camera" && (
          <div className="space-y-4 text-center">
            {cameraError ? (
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs space-y-3">
                <AlertCircle className="h-8 w-8 mx-auto text-red-400" />
                <p>{cameraError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold text-xs"
                >
                  Choose File from Device
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-amber-500/60 bg-slate-950 shadow-2xl">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={captureCameraPhoto}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg inline-flex items-center gap-2 cursor-pointer hover:brightness-110"
                >
                  <Camera className="h-4 w-4" /> Snap Photo
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRESET AVATARS */}
        {activeTab === "avatars" && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 font-bold font-mono uppercase tracking-wider text-center">
              Select a Curated ChessZen Avatar
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-52 overflow-y-auto p-1 custom-scrollbar">
              {PRESET_AVATARS.map((avatar) => {
                const isSelected = selectedAvatarSvg === avatar.svg;
                return (
                  <button
                    key={avatar.id}
                    onClick={() => {
                      setSelectedAvatarSvg(avatar.svg);
                      setSelectedRawImage(null);
                    }}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-amber-400 bg-amber-500/20 ring-2 ring-amber-400"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                    }`}
                  >
                    <div
                      className="w-14 h-14 rounded-full overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: avatar.svg }}
                    />
                    <span className="text-[10px] font-bold text-slate-300 truncate max-w-[80px]">
                      {avatar.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-between border-t border-amber-500/15 pt-4">
          {currentImage ? (
            <button
              onClick={handleRemovePicture}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove Picture
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndCrop}
              disabled={!selectedRawImage && !selectedAvatarSvg}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-40"
            >
              <Check className="h-4 w-4" /> Save Profile Picture
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
