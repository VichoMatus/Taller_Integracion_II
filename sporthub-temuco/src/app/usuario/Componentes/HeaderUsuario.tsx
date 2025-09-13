export default function HeaderUsuario() {
  return (
    <header>
      <div className="flex justify-between items-center">
        <p>Bienvenido, Usuario.</p>
        <div>
          <input
            type="text"
            placeholder="Buscar"
            className="px-3 py-1 rounded bg-gray-200"
          />
        </div>
      </div>
    </header>
  );
}
