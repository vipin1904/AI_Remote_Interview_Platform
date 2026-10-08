import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, SparklesIcon, BriefcaseIcon, CodeIcon, ChevronDownIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { useRole } from "../context/roleStore";

function Navbar() {
  const location = useLocation();
  const { role, selectRole, setShowRoleModal } = useRole();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
        {/* LOGO */}
        <Link
          to="/"
          className="group flex items-center gap-3 hover:scale-105 transition-transform duration-200"
        >
          <div className="size-10 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg ">
            <SparklesIcon className="size-6 text-white" />
          </div>

          <div className="flex flex-col">
            <span className="font-black text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
              Talent IQ
            </span>
            <span className="text-xs text-base-content/60 font-medium -mt-1">Code Together</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* ROLE SWITCHER DROPDOWN */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className={`btn btn-sm gap-2 border shadow-sm ${
                role === "interviewer"
                  ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                  : "bg-secondary/10 border-secondary text-secondary hover:bg-secondary/20"
              }`}
              title="Click to switch between Interviewer and Candidate views"
            >
              {role === "interviewer" ? (
                <>
                  <BriefcaseIcon className="size-4" />
                  <span className="font-bold hidden sm:inline">Interviewer</span>
                </>
              ) : (
                <>
                  <CodeIcon className="size-4" />
                  <span className="font-bold hidden sm:inline">Candidate</span>
                </>
              )}
              <ChevronDownIcon className="size-3.5 opacity-70" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-2 shadow-2xl bg-base-100 rounded-2xl w-56 border border-base-300 mt-2"
            >
              <li className="menu-title text-xs">Switch Workspace Mode</li>
              <li>
                <button
                  onClick={() => selectRole("interviewer")}
                  className={`flex items-center justify-between py-2.5 ${
                    role === "interviewer" ? "active font-bold" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="size-4 text-primary" />
                    <span>Interviewer Mode</span>
                  </div>
                  {role === "interviewer" && <span className="badge badge-primary badge-xs">Active</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => selectRole("candidate")}
                  className={`flex items-center justify-between py-2.5 ${
                    role === "candidate" ? "active font-bold" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CodeIcon className="size-4 text-secondary" />
                    <span>Candidate Mode</span>
                  </div>
                  {role === "candidate" && <span className="badge badge-secondary badge-xs">Active</span>}
                </button>
              </li>
              <div className="divider my-1"></div>
              <li>
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="text-xs text-base-content/70 hover:text-base-content"
                >
                  Role Info & Details...
                </button>
              </li>
            </ul>
          </div>

          {/* PROBLEMS PAGE LINK */}
          <Link
            to={"/problems"}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive("/problems")
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
            }`}
          >
            <div className="flex items-center gap-x-2">
              <BookOpenIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Problems</span>
            </div>
          </Link>

          {/* DASHBOARD PAGE LINK */}
          <Link
            to={"/dashboard"}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive("/dashboard")
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
            }`}
          >
            <div className="flex items-center gap-x-2">
              <LayoutDashboardIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Dashboard</span>
            </div>
          </Link>

          <div className="ml-2 flex items-center">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
