import { createHash } from 'crypto';
// import { AppDataSource } from '../dataSource';
import { Link } from '../entities/Link';

async function getLinkById(linkId: string): Promise<Link | null> {
  const link = await linkRepository
    .createQueryBuilder('link')
    .leftJoinAndSelect('link.user', 'user')
    .where('link.linkId = :linkId', { linkId })
    .select(['link', 'user.userId', 'user.username', 'user.isAdmin', 'user.isPro'])
    .getOne();
  return link;
}

function createLinkId(originalUrl: string, userId: string): string {
  const md5 = createHash('md5');
  md5.update(originalUrl + userId); /* TODO: concatenate the original url and userID */
  const urlHash = md5.digest('base64url');
  const linkId = urlHash.slice(9); /* TODO: Get only the first nine characters of `urlHash` */

  return linkId;
}

async function createNewLink(originalUrl: string, linkId: string, creator: User): Promise<Link> {
  let link = new Link();
  link.originalUrl = originalUrl;
  link.linkId = linkId;
  link.user = creator;
  link.numHits = 0;
  link = await linkRepository.save(link);
  return link;
}

async function updateLinkVisits(link: Link): Promise<Link> {
  link.numHits += 1;
  link.lastAccessedOn = new Date();
  link = await linkRepository.save(link);
  return link;
}

async function getLinksByUserId(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    .where({ user: { userId } })
    .leftJoin('link.user', 'user')
    .select(['link.linkId', 'link.originalUrl', 'user.userId', 'user.username', 'user.isAdmin'])
    .getMany();

  return links;
}

async function getLinksByUserIdForOwnAccount(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    .where({ user: { userId } })
    .leftJoin('link.user', 'user')
    .select([
      'link.linkId',
      'link.originalUrl',
      'link.numHits',
      'link.lastAccessedOn',
      'user.userId',
      'user.username',
      'user.isPro',
      'user.isAdmin',
    ])
    .getMany();

  return links;
}

export {
  getLinkById,
  createLinkId,
  createNewLink,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
};
