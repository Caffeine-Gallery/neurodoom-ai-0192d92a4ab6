import Text "mo:base/Text";

import Float "mo:base/Float";
import Array "mo:base/Array";
import Debug "mo:base/Debug";

actor {
  public func updateEnemyPositions(playerX : Float, playerY : Float, enemies : [{x : Float; y : Float}]) : async [{x : Float; y : Float}] {
    let updatedEnemies = Array.map<{x : Float; y : Float}, {x : Float; y : Float}>(enemies, func (enemy) {
      let dx = playerX - enemy.x;
      let dy = playerY - enemy.y;
      let distance = Float.sqrt(dx * dx + dy * dy);

      if (distance < 5.0) {
        return enemy;
      };

      let speed : Float = 1.0;
      let moveX = (dx / distance) * speed;
      let moveY = (dy / distance) * speed;

      let newX = enemy.x + moveX;
      let newY = enemy.y + moveY;

      Debug.print("Updated enemy position: (" # Float.toText(newX) # ", " # Float.toText(newY) # ")");

      {x = newX; y = newY}
    });

    updatedEnemies
  };
}
