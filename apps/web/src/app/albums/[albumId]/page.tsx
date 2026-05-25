import { AlbumDetailPage } from '@web/features/albums/components/album-detail-page';

interface AlbumDetailRouteProps {
  readonly params: Promise<{
    readonly albumId: string;
  }>;
}

export default async function AlbumDetailRoute({
  params
}: AlbumDetailRouteProps) {
  const { albumId } = await params;

  return <AlbumDetailPage albumId={albumId} />;
}
