import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, SparklesIcon, BriefcaseIcon, CodeIcon, ChevronDownIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { useRole } from "../context/roleStore";

function Navbar() {
  const location = useLocation();
  const { role, selectRole, setShowRoleModal } = useRole();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#262626] border-b border-[#383838] sticky top-0 z-50 shadow-md select-none">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* LOGO (LeetCode style orange icon & clean text) */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div className="size-8 rounded-lg bg-gradient-to-br from-[#ffa116] to-[#ffb800] flex items-center justify-center shadow text-black font-black">
            <SparklesIcon className="size-5 text-black" />
          </div>

          <div className="flex flex-col">
            <span className="font-black text-base text-[#eff1f6] tracking-tight">
              Remote<span className="text-[#ffa116]">Interview</span>
            </span>
            <span className="text-[10px] text-[#9ca3af] font-medium -mt-1 hidden sm:inline">Code Together</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* ROLE SWITCHER DROPDOWN */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className={`btn btn-xs gap-1.5 font-bold rounded-lg border shadow-sm ${
                role === "interviewer"
                  ? "bg-[#00b8a3]/15 border-[#00b8a3]/40 text-[#00b8a3] hover:bg-[#00b8a3]/25"
                  : "bg-[#ffa116]/15 border-[#ffa116]/40 text-[#ffa116] hover:bg-[#ffa116]/25"
              }`}
              title="Click to switch between Interviewer and Candidate views"
            >
              {role === "interviewer" ? (
                <>
                  <BriefcaseIcon className="size-3.5" />
                  <span className="hidden sm:inline">Interviewer</span>
                </>
              ) : (
                <>
                  <CodeIcon className="size-3.5" />
                  <span className="hidden sm:inline">Candidate</span>
                </>
              )}
              <ChevronDownIcon className="size-3 opacity-70" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-2 shadow-2xl bg-[#262626] text-[#eff1f6] rounded-xl w-56 border border-[#383838] mt-2"
            >
              <li className="menu-title text-[10px] uppercase font-bold text-[#9ca3af]">Switch Workspace Mode</li>
              <li>
                <button
                  onClick={() => selectRole("interviewer")}
                  className={`flex items-center justify-between py-2 text-xs rounded-lg hover:bg-[#333333] ${
                    role === "interviewer" ? "bg-[#333333] font-bold text-[#00b8a3]" : "text-[#eff1f6]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="size-4 text-[#00b8a3]" />
                    <span>Interviewer Mode</span>
                  </div>
                  {role === "interviewer" && <span className="badge badge-xs bg-[#00b8a3] text-black font-bold">Active</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => selectRole("candidate")}
                  className={`flex items-center justify-between py-2 text-xs rounded-lg hover:bg-[#333333] ${
                    role === "candidate" ? "bg-[#333333] font-bold text-[#ffa116]" : "text-[#eff1f6]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CodeIcon className="size-4 text-[#ffa116]" />
                    <span>Candidate Mode</span>
                  </div>
                  {role === "candidate" && <span className="badge badge-xs bg-[#ffa116] text-black font-bold">Active</span>}
                </button>
              </li>
              <div className="divider my-1 border-[#383838]"></div>
              <li>
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="text-xs text-[#9ca3af] hover:text-[#eff1f6] hover:bg-[#333333] rounded-lg"
                >
                  Role Info & Details...
                </button>
              </li>
            </ul>
          </div>

          {/* PROBLEMS PAGE LINK (LeetCode tab styling) */}
          <Link
            to={"/problems"}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isActive("/problems")
                ? "bg-[#333333] text-[#eff1f6] shadow-sm font-bold border border-[#444444]"
                : "text-[#9ca3af] hover:text-[#eff1f6] hover:bg-[#333333]/50"
            }`}
          >
            <BookOpenIcon className="size-3.5" />
            <span className="hidden sm:inline">Problems</span>
          </Link>

          {/* DASHBOARD PAGE LINK (LeetCode tab styling) */}
          <Link
            to={"/dashboard"}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isActive("/dashboard")
                ? "bg-[#333333] text-[#eff1f6] shadow-sm font-bold border border-[#444444]"
                : "text-[#9ca3af] hover:text-[#eff1f6] hover:bg-[#333333]/50"
            }`}
          >
            <LayoutDashboardIcon className="size-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="ml-1 flex items-center">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
