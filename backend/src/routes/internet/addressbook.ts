import { Route } from "~/lib/types/route.type";
import { Groups } from "~/db/client";
import { paginationSchema } from "~/lib/schemas/pagination.schema";
import { AddressBook } from "~/app/addressbook";

const addressBook = {
  settings: {
    groupOnly: Groups.User,
    title: "Get User Address Book",
    description: "Will fetch a users address book, is paged",
  },

  async post(req, res, error) {
    const body = await paginationSchema.safeParseAsync(req.body);

    if (!body.success) return error(body.error);

    const { page } = body.data;

    if (!req.session.userId) throw new Error("no userid");

    const addressBook = new AddressBook(req.session.userId);
    await addressBook.check();

    const results = await addressBook.fetch(64, page);
    const count = await addressBook.count();

    res.send({
      success: true,
      addresses: results,
      count: count,
      pages: Math.floor(count / 64) + 1,
    });
  },
} as Route;

export default addressBook;