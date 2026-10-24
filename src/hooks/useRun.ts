import { useNavigate } from 'react-router-dom';
import type { Answers } from '../data/types';
import { useSession } from '../state/session';

/** Saves an assessment to the session and plays the diagnosis sequence. */
export function useRun() {
  const { add } = useSession();
  const nav = useNavigate();
  return (a: Answers) => {
    const id = add(a);
    nav(`/item/${id}/analysing`);
  };
}
