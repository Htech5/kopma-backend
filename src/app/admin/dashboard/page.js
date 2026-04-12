import db from "@/lib/db";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [magazineRows] = await db.query(
    "SELECT COUNT(*) AS total FROM magazines"
  );

  const [eventRows] = await db.query("SELECT COUNT(*) AS total FROM events");
  
  const [commentRows] = await db.query(
    "SELECT COUNT(*) AS total FROM comments WHERE status = 'pending'"
  );

  return {
    totalMagazine: magazineRows[0].total,
    totalEvents: eventRows[0].total,
    totalPendingComments: commentRows[0].total,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-5 md:p-8 border border-green-100">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">
          Dashboard Admin
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          Selamat datang di admin panel Kopma.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl shadow p-5 md:p-6 border-l-4 border-green-600">
          <h3 className="text-gray-500 text-sm">Total Magazine</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {data.totalMagazine}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 md:p-6 border-l-4 border-green-600">
          <h3 className="text-gray-500 text-sm">Total Events</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {data.totalEvents}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 md:p-6 border-l-4 border-green-600">
          <h3 className="text-gray-500 text-sm">Komentar Pending</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {data.totalPendingComments}
          </p>
        </div>
      </div>
    </div>
  );
}