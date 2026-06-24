import Link from "next/link";

import { AccountBlock } from "@/components/shell/account-block";

import { NavItem } from "@/components/shell/nav-item";



export interface LearnerSidebarProps {

  pathname: string;

  displayName: string | null;

  email: string;

  levelLabel: string;

  navLabels: { home: string; courses: string; profile: string };

}



function isHomeActive(pathname: string): boolean {

  return pathname === "/learner";

}



function isCoursesActive(pathname: string): boolean {

  return pathname.startsWith("/learner/courses");

}



function isProfileActive(pathname: string): boolean {

  return pathname.startsWith("/learner/profile");

}



export function LearnerSidebar({

  pathname,

  displayName,

  email,

  levelLabel,

  navLabels,

}: LearnerSidebarProps) {

  return (

    <aside className="dashboard-sidebar" aria-label="Learner navigation">

      <div className="border-b border-border-brand px-4 py-4">

        <Link

          href="/learner"

          className="text-lg font-bold tracking-tight text-soil-brand"

        >

          Aniskwela

        </Link>

      </div>



      <nav className="dashboard-sidebar-nav" aria-label="Main">

        <NavItem

          href="/learner"

          label={navLabels.home}

          icon="⌂"

          active={isHomeActive(pathname)}

        />

        <NavItem

          href="/learner/courses"

          label={navLabels.courses}

          icon="☰"

          active={isCoursesActive(pathname)}

        />

        <NavItem

          href="/learner/profile"

          label={navLabels.profile}

          icon="◉"

          active={isProfileActive(pathname)}

        />

      </nav>



      <div className="dashboard-sidebar-footer">

        <AccountBlock

          href="/learner/profile"

          displayName={displayName}

          email={email}

          roleLabel={levelLabel}

        />

      </div>

    </aside>

  );

}

