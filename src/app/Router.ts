/**
 * Hash-based router. Single source of truth for the current view + selection.
 *
 * Routes:
 *   #/                                — home (courses dashboard)
 *   #/course/<courseId>               — course detail
 *   #/course/<courseId>/lesson/<id>   — reader for a lesson
 *   #/course/<courseId>/lesson/<id>#block-<blockId>  — reader scrolled to a block
 *
 * `home` is the default when the hash is empty or malformed.
 */

export type Route =
  | { kind: "home" }
  | { kind: "course"; courseId: string }
  | { kind: "lesson"; courseId: string; lessonId: string };

export function routeToHash(route: Route): string {
  switch (route.kind) {
    case "home":
      return "#/";
    case "course":
      return `#/course/${route.courseId}`;
    case "lesson":
      return `#/course/${route.courseId}/lesson/${route.lessonId}`;
  }
}

export function routeFromHash(hash: string): Route {
  const stripped = hash.startsWith("#") ? hash.slice(1) : hash;
  const path = stripped.startsWith("/") ? stripped.slice(1) : stripped;
  if (path === "" || path === "home") return { kind: "home" };

  const parts = path.split("/");
  if (parts[0] === "course" && parts[1]) {
    if (parts[2] === "lesson" && parts[3]) {
      return { kind: "lesson", courseId: parts[1], lessonId: parts[3] };
    }
    return { kind: "course", courseId: parts[1] };
  }
  return { kind: "home" };
}
