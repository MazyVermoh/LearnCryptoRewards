import { db } from "./server/db";
import { books, courses } from "./shared/schema";
import { coursesWithTranslations, booksWithTranslations } from "./server/seed-translations";
import { eq } from "drizzle-orm";

async function updateTranslations() {
  try {
    console.log("Updating Russian translations...");

    // Update courses with Russian translations
    for (const course of coursesWithTranslations) {
      const result = await db.update(courses)
        .set({
          titleRu: course.titleRu,
          descriptionRu: course.descriptionRu,
          instructorRu: course.instructorRu,
        })
        .where(eq(courses.title, course.title));
      console.log(`Updated course: ${course.title}`);
    }
    console.log("Updated courses with Russian translations");

    // Update books with Russian translations
    for (const book of booksWithTranslations) {
      const result = await db.update(books)
        .set({
          titleRu: book.titleRu,
          authorRu: book.authorRu,
          descriptionRu: book.descriptionRu,
        })
        .where(eq(books.title, book.title));
      console.log(`Updated book: ${book.title}`);
    }
    console.log("Updated books with Russian translations");

    console.log("Translation update completed!");
  } catch (error) {
    console.error("Error updating translations:", error);
  }
}

updateTranslations();