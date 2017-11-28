defmodule GameWeb.WorldChannel do
  use Phoenix.Channel

  def join("world", _message, socket) do
    {:ok, player_id} = Game.World.new_player()
    socket = assign(socket, :id, player_id)
    {:ok, socket}
  end

  def handle_in("coins", %{}, socket) do
    {:reply, {:ok, %{coins: Game.World.coins()}}, socket}
  end

  def terminate(_msg, socket) do
    Game.World.remove_player(socket.assigns[:id])
    :ok
  end
end
