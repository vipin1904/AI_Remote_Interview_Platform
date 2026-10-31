import React from "react";
import { X, Loader2Icon } from "lucide-react";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";

function VideoCallModal({ isOpen, onClose, call, streamClient, chatClient, channel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-base-100 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-200/50">
          <h3 className="text-lg font-semibold">Video Call</h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {call && streamClient ? (
            <StreamVideo client={streamClient}>
              <StreamCall call={call}>
                <VideoCallUI chatClient={chatClient} channel={channel} />
              </StreamCall>
            </StreamVideo>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Loader2Icon className="w-12 h-12 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoCallModal;
