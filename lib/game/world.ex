defmodule Game.World.State do
  defstruct [coins: [], players: %{}]
end

defmodule Game.World.Player do
  defstruct [position: %{x: 0, y: 0}]
end

defmodule Game.World do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(_) do
    coins = Enum.map(0..99, fn _ -> random_pos() end)
    {:ok, %Game.World.State{coins: coins}}
  end

  def coins do
    GenServer.call(__MODULE__, :coins)
  end

  def new_player do
    id = :rand.uniform() |> Float.to_string()
    pos = random_pos()
    player = %Game.World.Player{position: pos}

    GenServer.call(__MODULE__, {:new_player, id, player})
  end

  def remove_player(id) do
    GenServer.cast(__MODULE__, {:remove_player, id})
  end

  def handle_call(:coins, _from, %{coins: coins} = state) do
    {:reply, coins, state}
  end
  def handle_call({:new_player, id, player}, _from, state) do
    state = %{state | players: Map.put(state.players, id, player)}
    {:reply, {:ok, id}, state}
  end

  def handle_cast({:remove_player, id}, state) do
    state = %{state | players: Map.delete(state.players, id)}
    {:noreply, state}
  end

  defp random_pos do
    %{
      x: (:rand.uniform(300) - 150),
      y: (:rand.uniform(300) - 150),
    }
  end
end
