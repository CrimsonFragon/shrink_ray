import { AppDataSource } from '../dataSource';
import { Link } from '../entities/Link';

async function getLinkById(linkId: string): Promise<Link | null> {
  return await linkRepository
    .createQueryBuilder('link')
    .leftJoinAndSelect('link.user', 'user')
    .where('link.linkId = :linkId', { linkId })
    .select(['link', 'user.userId', 'user.username', 'user.isAdmin', 'user.isPro'])
    .getOne();
}

export { getLinkById };
