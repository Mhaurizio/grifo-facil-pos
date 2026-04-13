import { usePOS } from '@/context/POSContext';
import { useNavigate } from 'react-router-dom';

const TableMap = () => {
  const { tables, user, setSelectedTable } = usePOS();
  const navigate = useNavigate();

  const handleTableTap = (tableNum: number) => {
    setSelectedTable(tableNum);
    navigate('/order');
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mesas</h1>
          <p className="text-sm text-muted-foreground">Hola, {user?.name}</p>
        </div>
        <button
          onClick={() => { navigate('/'); }}
          className="text-sm text-muted-foreground bg-secondary rounded-lg px-3 py-2"
        >
          Salir
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {tables.map(table => (
          <button
            key={table.number}
            onClick={() => handleTableTap(table.number)}
            className={`relative rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 min-h-[140px] ${
              table.status === 'occupied'
                ? 'bg-table-occupied/20 border-2 border-table-occupied shadow-lg shadow-table-occupied/10'
                : 'bg-secondary border-2 border-border'
            }`}
          >
            <span className="text-3xl">
              {table.status === 'occupied' ? '🟢' : '⚪'}
            </span>
            <span className="text-lg font-bold text-foreground">Mesa {table.number}</span>
            {table.status === 'occupied' && (
              <span className="text-xs font-medium bg-table-occupied text-accent-foreground rounded-full px-3 py-1">
                {table.itemCount} items
              </span>
            )}
            {table.status === 'free' && (
              <span className="text-xs text-muted-foreground">Disponible</span>
            )}
          </button>
        ))}
      </div>

      {user?.role === 'dueño' && (
        <button
          onClick={() => navigate('/owner')}
          className="mt-4 w-full touch-target rounded-lg bg-secondary text-secondary-foreground font-medium py-3 text-sm"
        >
          👔 Panel del Dueño
        </button>
      )}
    </div>
  );
};

export default TableMap;
