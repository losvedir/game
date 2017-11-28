defmodule Game.World do
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init(_) do
    coins = Enum.map(0..99, fn _ -> random_pos() end)
    {:ok, %{coins: coins}}
  end

  def coins do
    GenServer.call(__MODULE__, :coins)
  end

  def handle_call(:coins, _from, %{coins: coins} = state) do
    {:reply, coins, state}
  end

  defp random_pos do
    %{
      x: (:rand.uniform(300) - 150),
      y: (:rand.uniform(300) - 150),
    }
  end
end

defmodule Game.World.State do
  defstruct [coins: []]
end
