import PageHeader from "@/components/PageHeader";
import BooksTable from "@/components/BooksTable";
import BooksSummaryCards from "@/components/BooksSummaryCards";
import { getBooks } from "@/lib/books";
import AddBookButton from "@/components/AddBookButton";

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <>
      <PageHeader
        title="Books"
        description="Browse and manage all books in your inventory."
      >
        <AddBookButton />
      </PageHeader>

      <div className="space-y-8 p-8">
        <BooksSummaryCards books={books} />
        <BooksTable
          books={books}
          title="All Books"
          enableFilters
          enablePageSizeSelector
        />
      </div>
    </>
  );
}
