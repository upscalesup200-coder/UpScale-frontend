import { API_ROUTES } from '@/config/api';
import { AlertTriangle } from 'lucide-react';
import BootcampClient from './BootcampClient'; 

async function fetchBootcampDetails(id: string) {
  try {
    const fetchUrl = API_ROUTES.BOOTCAMP_DETAILS(id).replace('localhost', '127.0.0.1');
    
    console.log(`[Server Fetch - Bootcamp] Requesting: ${fetchUrl}`); 

    const res = await fetch(fetchUrl, { next: { revalidate: 60 } });
    
    if (!res.ok) {
        console.error(`[Server Fetch - Bootcamp] Failed with Status: ${res.status}`);
        return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error("[Server Fetch - Bootcamp] Network Error:", error);
    return null;
  }
}

export default async function BootcampDetailsPage({ params }: { params: any }) {
  const resolvedParams = await params;
  const bootcampId = resolvedParams?.id;

  if (!bootcampId) {
     console.error("[Server Fetch - Bootcamp] Bootcamp ID is missing!");
     return null;
  }

  const bootcamp = await fetchBootcampDetails(bootcampId);

  if (!bootcamp) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center gap-4">
          <div className="p-6 bg-red-500/10 rounded-full text-red-500">
              <AlertTriangle size={48} />
          </div>
          <p className="font-bold text-xl text-gray-300">عذراً، هذا المعسكر غير متوفر أو تم إزالته.</p>
      </div>
    );
  }

  return <BootcampClient bootcamp={bootcamp} id={bootcampId} />;
}