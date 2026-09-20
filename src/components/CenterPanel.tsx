import { useCourseSearch } from "../context/CourseSearchContext";
import { useSchedule } from "../context/ScheduleContext";
import EmptyState from "./EmptyState";
import HeroPanel from "./HeroPanel";
import SearchResultsPanel from "./SearchResultsPanel";
import SelectedCourseWorkspace from "./SelectedCourseWorkspace";

export default function CenterPanel() {
  const { isSearchActive } = useCourseSearch();
  const { crns } = useSchedule();
  if (isSearchActive) return <SearchResultsPanel />;
  if (crns.length > 0) return <SelectedCourseWorkspace />;
  return <><HeroPanel /><EmptyState /></>;
}
