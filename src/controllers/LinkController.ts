import { Request, Response } from 'express';
import {
  createLinkId,
  createNewLink,
  getLinkById,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
} from '../models/LinkModel';
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

  // Generate a `linkID`
  try {
    const linkId = createLinkId(originalUrl, userId);
    const newLink = await createNewLink(originalUrl, linkId, user);
    res.status(201).json(newLink);
  } catch (err) {
    console.log(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function getOriginalUrl(req: Request, res: Response): Promise<void> {
  const { linkId } = req.params as LinkIdParam;
  const link = await getLinkById(linkId);
  if (!link) {
    res.sendStatus(404);
    return;
  }

  updateLinkVisits(link);
  res.redirect(302, link.originalUrl);
}

async function getLinksForUser(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as TargetUserRequest;

  const user = await getUserById(userId);
  if (!user) {
    res.sendStatus(404);
    return;
  }

  try {
    if (req.session.isLoggedIn) {
      if (
        req.session.authenticatedUser.userId === userId ||
        req.session.authenticatedUser.isAdmin
      ) {
        const links = await getLinksByUserIdForOwnAccount(userId);
        res.json(links);
      } else {
        const links = await getLinkById(userId);
        res.json(links);
      }
    }
  } catch (err) {
    console.log(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

export default { shortenUrl, getOriginalUrl, getLinksForUser };
