import { Request, Response } from 'express';
import { createLinkId, createNewLink } from '../models/LinkModel';
import { getUserById } from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';

async function shortenUrl(req: Request, res: Response): Promise<void> {
  const { originalUrl } = req.body as NewLinkRequest;

  // Make sure the user is logged in
  if (!req.session.isLoggedIn) {
    res.sendStatus(401);
    return;
  }

  // Get the userId from req.session
  const { userId, isAdmin, isPro } = req.session.authenticatedUser;

  // Retrieve the user's account data using their ID
  const user = await getUserById(userId);
  if (!user) {
    res.sendStatus(404);
    return;
  }

  // Check if the user is neither a "pro" nor an "admin" account
  if (!(isAdmin || isPro) && user.links.length >= 5) {
    res.sendStatus(403);
    return;
  }

  // Generate a `linkID
  try {
    const linkId = createLinkId(originalUrl, userId);
    const newLink = await createNewLink(originalUrl, linkId, user);
    res.status(201).json(newLink);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

export default { shortenUrl };
