import { NavItem } from "@/components/shell/nav-item";



export interface LearnerBottomNavProps {

  pathname: string;

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



export function LearnerBottomNav({

  pathname,

  navLabels,

}: LearnerBottomNavProps) {

  return (

    <nav className="dashboard-bottom-nav" aria-label="Learner navigation">

      <NavItem

        href="/learner"

        label={navLabels.home}

        icon="⌂"

        active={isHomeActive(pathname)}

        variant="bottom"

      />

      <NavItem

        href="/learner/courses"

        label={navLabels.courses}

        icon="☰"

        active={isCoursesActive(pathname)}

        variant="bottom"

      />

      <NavItem

        href="/learner/profile"

        label={navLabels.profile}

        icon="◉"

        active={isProfileActive(pathname)}

        variant="bottom"

      />

    </nav>

  );

}

