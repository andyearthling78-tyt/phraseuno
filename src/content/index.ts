import type { Course } from "../domain/types.ts";
import { week1 } from "./es/week1.ts";
import { week2 } from "./es/week2.ts";
// Courses by id. A further language is one more entry here plus its content files.
export const spanish: Course = { id: "es", speechLocale: "es-ES", name: { de: "Spanisch", en: "Spanish" }, weeks: [week1, week2] };
export const courses: Record<string, Course> = { es: spanish };
export const defaultCourse = spanish;
