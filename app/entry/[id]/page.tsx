import { use } from 'react';
import EntryClient from './EntryClient';

export default function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EntryClient id={id} />;
}
