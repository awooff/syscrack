import { Route } from "~/lib/types/route.type";
import { Groups } from "~/db/client";
import { paginationSchema } from "~/lib/schemas/pagination.schema";
import { AccountBook } from "~/app/accountbook";

const accountBook = {
  settings: {
    groupOnly: Groups.User,
    title: "Get User Account Book",
    description: "Will fetch a users account book, is paged",
  },

  async post(req, res, error) {
    const body = await paginationSchema.safeParseAsync(req.body);

    if (!body.success) return error(body.error);

    const { page } = body.data;

    if (!req.session.userId) throw new Error("no userid");

    const accountBook = new AccountBook(req.session.userId);
    await accountBook.check();

    const results = await accountBook.fetch(64, page);
    const count = await accountBook.count();

    res.send({
      success: true,
      addresses: results,
      count: count,
      pages: Math.floor(count / 64) + 1,
    });
  },
} as Route;

export default accountBook;
