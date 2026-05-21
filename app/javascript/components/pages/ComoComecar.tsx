import { CourseSpacePage } from "./CourseSpacePage";
import { ExpertHotAccessPage } from "./ExpertHotAccessPage";

export function ComoComecar() {
  const pathname = typeof window === "undefined" ? "" : window.location.pathname;
  return pathname.includes("a4b99e") ? <CourseSpacePage slug="basico" /> : <ExpertHotAccessPage />;
}
