defmodule GameWeb.WorldChannel do
  use Phoenix.Channel

  def join("world", _message, socket) do
    {:ok, socket}
  end

  def handle_in("coins", %{}, socket) do
    {:reply, {:ok, %{coins: Game.World.coins()}}, socket}
  end
end
