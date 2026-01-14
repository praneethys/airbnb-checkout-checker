import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useProperty,
  useRooms,
  useCreateRoom,
  useChecks,
  useCreateCheck,
  useChecklistItems,
  useCreateChecklistItem,
  useCostHistory,
} from '../hooks/api';
import { PhotoUpload } from '../components/PhotoUpload';

export function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const propertyId = Number(id);

  const { data: property } = useProperty(propertyId);
  const { data: rooms } = useRooms(propertyId);
  const { data: checks } = useChecks(propertyId);
  const { data: costHistory } = useCostHistory(propertyId);

  const createRoom = useCreateRoom(propertyId);
  const createCheck = useCreateCheck(propertyId);

  const [newRoom, setNewRoom] = useState({ name: '', room_type: 'other' as const });
  const [activeCheck, setActiveCheck] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  if (!property) return <p>Loading...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <Link to="/">← Back</Link>
      <h1>{property.name}</h1>
      <p>{property.address}</p>

      <section>
        <h2>Rooms</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            placeholder="Room name"
            value={newRoom.name}
            onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
          />
          <select
            value={newRoom.room_type}
            onChange={(e) =>
              setNewRoom({ ...newRoom, room_type: e.target.value as typeof newRoom.room_type })
            }
          >
            <option value="bedroom">Bedroom</option>
            <option value="bathroom">Bathroom</option>
            <option value="kitchen">Kitchen</option>
            <option value="living_room">Living Room</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={() => {
              createRoom.mutate(newRoom);
              setNewRoom({ name: '', room_type: 'other' });
            }}
          >
            Add Room
          </button>
        </div>
        <ul>
          {rooms?.map((r) => (
            <li key={r.id}>
              {r.name} ({r.room_type})
              <button
                onClick={() => setSelectedRoom(selectedRoom === r.id ? null : r.id)}
                style={{ marginLeft: '0.5rem' }}
              >
                {selectedRoom === r.id ? 'Hide Items' : 'Manage Items'}
              </button>
              {selectedRoom === r.id && <RoomItems roomId={r.id} />}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Checks</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() =>
              createCheck.mutate({
                check_type: 'checkin',
                guest_name: prompt('Guest name?') || undefined,
              })
            }
          >
            New Check-in
          </button>
          <button
            onClick={() =>
              createCheck.mutate({
                check_type: 'checkout',
                guest_name: prompt('Guest name?') || undefined,
              })
            }
          >
            New Check-out
          </button>
        </div>
        <ul>
          {checks?.map((c) => (
            <li key={c.id}>
              {c.check_type.toUpperCase()} - {c.guest_name || 'Unknown'} -{' '}
              {new Date(c.created_at).toLocaleDateString()}
              <button
                onClick={() => setActiveCheck(activeCheck === c.id ? null : c.id)}
                style={{ marginLeft: '0.5rem' }}
              >
                {activeCheck === c.id ? 'Hide' : 'Upload Photos'}
              </button>
              {activeCheck === c.id && rooms && (
                <div style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
                  {rooms.map((r) => (
                    <PhotoUpload key={r.id} checkId={c.id} roomId={r.id} roomName={r.name} />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Damage Report</h2>
        {checks && checks.length >= 2 && (
          <DamageReportSelector propertyId={propertyId} checks={checks} />
        )}
      </section>

      <section>
        <h2>Cost History</h2>
        {costHistory && costHistory.length > 0 ? (
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Guest</th>
                <th>Issue</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {costHistory.map((h, i) => (
                <tr key={i}>
                  <td>{new Date(h.date).toLocaleDateString()}</td>
                  <td>{h.guest || '-'}</td>
                  <td>{h.issue.description}</td>
                  <td>${h.issue.estimated_cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No issues recorded yet.</p>
        )}
      </section>
    </div>
  );
}

function RoomItems({ roomId }: { roomId: number }) {
  const { data: items } = useChecklistItems(roomId);
  const createItem = useCreateChecklistItem(roomId);
  const [newItem, setNewItem] = useState({ name: '', replacement_cost: 0 });

  return (
    <div style={{ paddingLeft: '1rem', marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          placeholder="Item name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Cost"
          value={newItem.replacement_cost}
          onChange={(e) => setNewItem({ ...newItem, replacement_cost: Number(e.target.value) })}
          style={{ width: '80px' }}
        />
        <button
          onClick={() => {
            createItem.mutate(newItem);
            setNewItem({ name: '', replacement_cost: 0 });
          }}
        >
          Add
        </button>
      </div>
      <ul>
        {items?.map((i) => (
          <li key={i.id}>
            {i.name} - ${i.replacement_cost}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DamageReportSelector({
  propertyId,
  checks,
}: {
  propertyId: number;
  checks: Array<{ id: number; check_type: string; guest_name: string | null; created_at: string }>;
}) {
  const [checkinId, setCheckinId] = useState<number>(0);
  const [checkoutId, setCheckoutId] = useState<number>(0);

  const checkins = checks.filter((c) => c.check_type === 'checkin');
  const checkouts = checks.filter((c) => c.check_type === 'checkout');

  const { data: report, isLoading } = useDamageReport(propertyId, checkinId, checkoutId);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <select value={checkinId} onChange={(e) => setCheckinId(Number(e.target.value))}>
          <option value={0}>Select Check-in</option>
          {checkins.map((c) => (
            <option key={c.id} value={c.id}>
              {c.guest_name || 'Unknown'} - {new Date(c.created_at).toLocaleDateString()}
            </option>
          ))}
        </select>
        <select value={checkoutId} onChange={(e) => setCheckoutId(Number(e.target.value))}>
          <option value={0}>Select Check-out</option>
          {checkouts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.guest_name || 'Unknown'} - {new Date(c.created_at).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>
      {isLoading && <p>Generating report...</p>}
      {report && (
        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>
          <h3>Damage Report: {report.property_name}</h3>
          <p>Guest: {report.guest_name || 'Unknown'}</p>
          <p>
            Period: {new Date(report.checkin_date).toLocaleDateString()} -{' '}
            {new Date(report.checkout_date).toLocaleDateString()}
          </p>
          <h4>Issues ({report.issues.length})</h4>
          <ul>
            {report.issues.map((i) => (
              <li key={i.id}>
                {i.description} - ${i.estimated_cost} ({i.severity})
              </li>
            ))}
          </ul>
          <p>
            <strong>Total Estimated Cost: ${report.total_estimated_cost.toFixed(2)}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
