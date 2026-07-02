import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/policy-manage/applications');
}
