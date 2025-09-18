"use client";

export default function HeaderUsuario() {
  let menuOpen = false;
  let menuRef: HTMLDivElement | null = null;

  function toggleMenu() {
    menuOpen = !menuOpen;
    renderMenu();
  }

  function handleClickOutside(event: MouseEvent) {
    if (menuRef && !menuRef.contains(event.target as Node)) {
      menuOpen = false;
      renderMenu();
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }

  function renderMenu() {
    const menu = document.getElementById("dropdown-menu");
    if (menu) {
      menu.style.display = menuOpen ? "flex" : "none";
      menu.style.flexDirection = "column";
      menu.style.alignItems = "center";
      menu.style.justifyContent = "center";
      menu.style.position = "absolute";
      menu.style.right = "0";
      menu.style.top = "110%";
      menu.style.background = "#F3F4F6";
      menu.style.borderRadius = "0.5rem";
      menu.style.minWidth = "170px";
      menu.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
      menu.style.zIndex = "10";
      if (menuOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    }
  }

  function setMenuRef(node: HTMLDivElement) {
    menuRef = node;
  }

  return (
    <header className="p-6 bg-[#EEF2F1]">
      <div className="flex justify-between items-center gap-8">

        <div className="text-2xl font-semibold text-[#232124] ml-2 min-w-[220px] flex items-center justify-center">
          Bienvenido, Usuario
        </div>


        <div className="flex items-center gap-6">
          <div
            className="flex items-center bg-[#B8CFCE] rounded-full"
            style={{
              width: "320px",
              padding: "0.5rem 1.2rem",
              border: "2.5px solid #B8CFCE",
              fontSize: "0.95rem",
              fontWeight: 400,
              minHeight: "32px",
              height: "32px",
              marginRight: "30px",
            }}
          >
            <input
              type="text"
              placeholder="Buscar"
              className="bg-transparent outline-none flex-1 text-base placeholder-[#4B484E]"
              style={{
                fontWeight: 400,
                fontSize: "0.95rem",
                height: "18px",
                border: "none",
                boxShadow: "none",
              }}
            />
            <span className="ml-3 text-xl text-[#4B484E] select-none">🔍</span>
          </div>

          <div className="relative flex items-center justify-center" ref={setMenuRef as any}>
            <div
              className="flex items-center gap-2 bg-[#B8CFCE] px-6 py-1 rounded-full cursor-pointer"
              style={{
                minWidth: "120px",
                minHeight: "32px",
                height: "32px",
                fontSize: "0.85rem",
                fontWeight: 500,
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={toggleMenu}
            >
              <img
                src="/usuario/perro.jpg"
                alt="Perfil"
                className="w-7 h-7 rounded-full object-cover"
                style={{ marginRight: "6px" }}
              />
              <span className="font-semibold text-sm text-[#232124] text-center">Usuario</span>
              <span className="text-sm text-[#232124]">▼</span>
            </div>

            <div
              id="dropdown-menu"
              style={{
                display: "none",
                background: "#F3F4F6",
                borderRadius: "0.5rem",
                minWidth: "170px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                zIndex: 10,
                position: "absolute",
                right: 0,
                top: "110%",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="py-2"
            >
              <p className="px-4 py-2 text-[10px] text-[#232124] hover:bg-gray-200 cursor-pointer w-full text-center rounded">
                Editar Perfil
              </p>
              <p className="px-4 py-2 text-[10px] text-[#232124] hover:bg-gray-200 cursor-pointer w-full text-center rounded">
                Cerrar Sesión
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}