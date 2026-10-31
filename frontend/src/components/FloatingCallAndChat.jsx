import { useState, useRef, useEffect } from "react";
import {
  StreamCall,
  StreamVideo,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
  CallingState,
} from "@stream-io/video-react-sdk";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import {
  VideoIcon,
  VideoOffIcon,
  MessageSquareIcon,
  Maximize2Icon,
  Minimize2Icon,
  MinusIcon,
  PlusIcon,
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MoveIcon,
  UsersIcon,
  Loader2Icon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  Volume2Icon,
} from "lucide-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

// Inner video component to consume StreamCall hooks
function FloatingVideoCallBody({ chatClient, channel }) {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center bg-[#1a1a1a] text-[#eff1f6]">
        <Loader2Icon className="w-8 h-8 animate-spin text-[#00b8a3] mb-2" />
        <p className="text-xs text-[#9ca3af]">Connecting to video stream...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between relative bg-[#181818] rounded-xl overflow-hidden str-video border border-[#333333]">
      {/* Top participant pill */}
      <div className="absolute top-2 left-2 z-10 bg-[#262626]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#eff1f6] flex items-center gap-1.5 shadow border border-[#383838]">
        <span className="size-2 bg-[#00ea64] rounded-full animate-pulse"></span>
        <span>
          {participantCount} {participantCount === 1 ? "person" : "people"} in call
        </span>
      </div>

      {/* Main Speaker Layout */}
      <div className="flex-1 w-full h-full min-h-0 relative">
        <SpeakerLayout />
      </div>

      {/* Compact Call Controls bar */}
      <div className="bg-[#262626]/95 backdrop-blur-md px-2 py-1.5 border-t border-[#383838] flex items-center justify-center">
        <CallControls />
      </div>
    </div>
  );
}

export default function FloatingCallAndChat({
  isOpen,
  onClose,
  call,
  streamClient,
  chatClient,
  channel,
  isInitializingCall,
  session,
}) {
  const [activeTab, setActiveTab] = useState("video");
  const [size, setSize] = useState("normal");
  const [isMinimized, setIsMinimized] = useState(false);

  // Position state (draggable)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest("button") || e.target.closest("input")) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setPosition({
        x: dragStartRef.current.posX + dx,
        y: dragStartRef.current.posY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const decreaseSize = () => {
    if (size === "large") setSize("normal");
    else if (size === "normal") setSize("mini");
  };

  const increaseSize = () => {
    if (size === "mini") setSize("normal");
    else if (size === "normal") setSize("large");
  };

  if (!isOpen) return null;

  const getSizeDimensions = () => {
    if (size === "mini") {
      return { width: "w-72", height: "h-52", label: "Mini (288px)" };
    }
    if (size === "large") {
      return { width: "w-[560px]", height: "h-[420px]", label: "Large (560px)" };
    }
    if (size === "docked") {
      return { width: "w-96", height: "h-[calc(100vh-5rem)]", label: "Docked" };
    }
    return { width: "w-96", height: "h-80", label: "Normal (384px)" };
  };

  const dimensions = getSizeDimensions();

  // If minimized into a compact top-right pill
  if (isMinimized) {
    return (
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
        className="fixed top-16 right-4 z-50 flex items-center gap-2 bg-[#262626]/95 backdrop-blur-md border border-[#00b8a3]/50 shadow-2xl rounded-full px-4 py-2 cursor-pointer hover:border-[#00b8a3] transition-all select-none text-[#eff1f6]"
        onClick={() => setIsMinimized(false)}
      >
        <span className="size-2.5 bg-[#00ea64] rounded-full animate-ping"></span>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <VideoIcon className="size-4 text-[#00b8a3]" />
          <span>Call & Chat Active</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(false);
          }}
          className="btn btn-ghost btn-xs btn-square ml-1 text-[#9ca3af] hover:text-[#eff1f6]"
          title="Restore window"
        >
          <ChevronUpIcon className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      className={`fixed ${
        size === "docked" ? "top-14 right-0" : "top-16 right-4"
      } z-50 ${dimensions.width} ${
        dimensions.height
      } flex flex-col bg-[#1a1a1a]/95 text-[#eff1f6] backdrop-blur-xl border-2 border-[#383838] rounded-2xl shadow-2xl overflow-hidden transition-all duration-150`}
    >
      {/* HEADER BAR (Draggable) */}
      <div
        onMouseDown={handleMouseDown}
        className={`px-3 py-2 bg-[#262626] border-b border-[#383838] flex items-center justify-between cursor-move select-none ${
          isDragging ? "opacity-80" : ""
        }`}
      >
        {/* Left: Tab selectors (Video / Chat / Split) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("video")}
            className={`btn btn-xs gap-1 font-bold rounded-lg ${
              activeTab === "video" ? "bg-[#00b8a3] text-black border-none" : "btn-ghost text-[#9ca3af] hover:text-[#eff1f6]"
            }`}
          >
            <VideoIcon className="size-3.5" />
            <span className="hidden sm:inline">Video</span>
          </button>

          {chatClient && channel && (
            <button
              onClick={() => setActiveTab("chat")}
              className={`btn btn-xs gap-1 font-bold rounded-lg ${
                activeTab === "chat" ? "bg-[#ffa116] text-black border-none" : "btn-ghost text-[#9ca3af] hover:text-[#eff1f6]"
              }`}
            >
              <MessageSquareIcon className="size-3.5" />
              <span className="hidden sm:inline">Chat</span>
            </button>
          )}

          {chatClient && channel && size !== "mini" && (
            <button
              onClick={() => setActiveTab("split")}
              className={`btn btn-xs font-bold rounded-lg hidden md:flex ${
                activeTab === "split" ? "bg-[#383838] text-[#eff1f6]" : "btn-ghost text-[#9ca3af]"
              }`}
              title="View Video and Chat side-by-side"
            >
              <span>Split</span>
            </button>
          )}
        </div>

        {/* Right: Size Controls & Window actions */}
        <div className="flex items-center gap-1 text-[#9ca3af]">
          <button
            onClick={decreaseSize}
            disabled={size === "mini"}
            className="btn btn-ghost btn-xs btn-square hover:text-[#eff1f6]"
            title="Decrease size"
          >
            <MinusIcon className="size-3.5" />
          </button>

          <button
            onClick={increaseSize}
            disabled={size === "large" || size === "docked"}
            className="btn btn-ghost btn-xs btn-square hover:text-[#eff1f6]"
            title="Increase size"
          >
            <PlusIcon className="size-3.5" />
          </button>

          <button
            onClick={() => setSize(size === "docked" ? "normal" : "docked")}
            className={`btn btn-ghost btn-xs btn-square hover:text-[#eff1f6] ${
              size === "docked" ? "text-[#00b8a3]" : ""
            }`}
            title={size === "docked" ? "Float window" : "Dock to right"}
          >
            {size === "docked" ? (
              <PanelRightCloseIcon className="size-3.5" />
            ) : (
              <PanelRightOpenIcon className="size-3.5" />
            )}
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="btn btn-ghost btn-xs btn-square hover:text-[#eff1f6]"
            title="Minimize to floating pill"
          >
            <ChevronDownIcon className="size-3.5" />
          </button>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-square text-[#ff375f] hover:bg-[#ff375f]/20"
            title="Hide video/chat popup"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="flex-1 overflow-hidden relative p-1.5 bg-[#181818]">
        {/* Tab 1: Video Call */}
        {activeTab === "video" && (
          <div className="w-full h-full">
            {isInitializingCall ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Loader2Icon className="size-8 animate-spin text-[#00b8a3] mb-2" />
                <p className="text-xs font-medium text-[#9ca3af]">Joining interview call...</p>
              </div>
            ) : !streamClient || !call ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <VideoOffIcon className="size-8 text-[#ff375f]/60 mb-2" />
                <p className="text-xs text-[#9ca3af]">Connecting to stream service...</p>
              </div>
            ) : (
              <StreamVideo client={streamClient}>
                <StreamCall call={call}>
                  <FloatingVideoCallBody chatClient={chatClient} channel={channel} />
                </StreamCall>
              </StreamVideo>
            )}
          </div>
        )}

        {/* Tab 2: Chat */}
        {activeTab === "chat" && chatClient && channel && (
          <div className="w-full h-full rounded-xl overflow-hidden flex flex-col bg-[#1c1e22] border border-[#383838]">
            <div className="flex-1 overflow-hidden stream-chat-dark">
              <Chat client={chatClient} theme="str-chat__theme-dark">
                <Channel channel={channel}>
                  <Window>
                    <MessageList />
                    <MessageInput />
                  </Window>
                  <Thread />
                </Channel>
              </Chat>
            </div>
          </div>
        )}

        {/* Tab 3: Split Video + Chat */}
        {activeTab === "split" && (
          <div className="w-full h-full flex gap-2">
            <div className="w-1/2 h-full">
              {streamClient && call ? (
                <StreamVideo client={streamClient}>
                  <StreamCall call={call}>
                    <FloatingVideoCallBody chatClient={chatClient} channel={channel} />
                  </StreamCall>
                </StreamVideo>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#9ca3af]">
                  Video call offline
                </div>
              )}
            </div>
            <div className="w-1/2 h-full rounded-xl overflow-hidden bg-[#1c1e22] border border-[#383838]">
              {chatClient && channel && (
                <div className="w-full h-full stream-chat-dark">
                  <Chat client={chatClient} theme="str-chat__theme-dark">
                    <Channel channel={channel}>
                      <Window>
                        <MessageList />
                        <MessageInput />
                      </Window>
                    </Channel>
                  </Chat>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER STATUS BAR */}
      <div className="px-3 py-1 bg-[#262626] border-t border-[#383838] text-[10px] text-[#9ca3af] flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 bg-[#00ea64] rounded-full"></span>
          RemoteInterview Live Stream
        </span>
        <span className="font-mono text-[#9ca3af]">{dimensions.label}</span>
      </div>
    </div>
  );
}
