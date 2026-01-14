import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProperties, useCreateProperty } from '../hooks/api';

export function HomePage() {
  const { data: properties, isLoading } = useProperties();
  const createProperty = useCreateProperty();
  const [newProp, setNewProp] = useState({ name: '', address: '' });

  const handleCreate = () => {
    if (!newProp.name) return;
    createProperty.mutate(newProp);
    setNewProp({ name: '', address: '' });
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Airbnb Checkout Checker</h1>
      <p>Manage your properties and track guest check-ins/check-outs.</p>

      <section style={{ marginTop: '2rem' }}>
        <h2>Add Property</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            placeholder="Property name"
            value={newProp.name}
            onChange={(e) => setNewProp({ ...newProp, name: e.target.value })}
          />
          <input
            placeholder="Address"
            value={newProp.address}
            onChange={(e) => setNewProp({ ...newProp, address: e.target.value })}
          />
          <button onClick={handleCreate} disabled={createProperty.isPending}>
            Add
          </button>
        </div>
      </section>

      <section>
        <h2>Your Properties</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : properties?.length ? (
          <ul>
            {properties.map((p) => (
              <li key={p.id} style={{ marginBottom: '0.5rem' }}>
                <Link to={`/property/${p.id}`}>{p.name}</Link>
                {p.address && <span style={{ color: '#666' }}> - {p.address}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No properties yet. Add one above!</p>
        )}
      </section>
    </div>
  );
}
