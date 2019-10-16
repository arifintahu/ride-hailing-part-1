import { DriverPosition } from "./orm";
import { bus } from "./bus";
import { NatsError } from "nats";

interface Movement {
  rider_id: number;
  north: number;
  west: number;
  east: number;
  south: number;
}

async function positionUpdater(movement: Movement) {
  const { north, south, east, west, rider_id } = movement;
  console.log("update position");
  // update driver position
  const [position, created] = await DriverPosition.findOrCreate({
    defaults: {
      latitude: 0,
      longitude: 0
    },
    where: {
      rider_id
    }
  });
  // update latitude & longitude
  let latitude = parseFloat(position.get("latitude") as string);
  latitude = latitude + north - south;
  let longitude = parseFloat(position.get("longitude") as string);
  longitude = longitude + east - west;

  try {
    await position.update({
      latitude,
      longitude
    });
  } catch (err) {
    console.error(err);
  }
}

export function positionProjector(): number {
  return bus.subscribe("rider.moved", (movement: Movement) => {
    positionUpdater(movement);
  });
}
