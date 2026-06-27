// Panel status mengambang. Komponen "presentational" murni:
// hanya menerima props lalu menampilkannya.

interface Coords {
  lat: number;
  lng: number;
}

interface Props {
  connected: boolean;
  name: string;
  onlineCount: number;
  coords: Coords | null;
}

export default function StatusPanel({
  connected,
  name,
  onlineCount,
  coords,
}: Props) {
  return (
    <aside id="panel">
      <header className="panel-head">
        <span className={connected ? 'dot live' : 'dot'} />
        <h1>Live Map</h1>
      </header>

      <dl className="panel-stats">
        <div className="row">
          <dt>Status</dt>
          <dd>{connected ? 'terhubung' : 'terputus'}</dd>
        </div>
        <div className="row">
          <dt>Nama</dt>
          <dd>{name}</dd>
        </div>
        <div className="row">
          <dt>Online</dt>
          <dd>{onlineCount}</dd>
        </div>
        <div className="row">
          <dt>Posisi</dt>
          <dd className="mono">
            {coords
              ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
              : 'menunggu GPS…'}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
