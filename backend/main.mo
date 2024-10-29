import Text "mo:base/Text";

import Float "mo:base/Float";
import Debug "mo:base/Debug";

actor {
  public func updateEnemyPosition(playerX : Float, playerY : Float, enemyX : Float, enemyY : Float) : async {x : Float; y : Float} {
    let dx = playerX - enemyX;
    let dy = playerY - enemyY;
    let distance = Float.sqrt(dx * dx + dy * dy);

    if (distance < 5.0) {
      return {x = enemyX; y = enemyY};
    };

    let speed : Float = 2.0;
    let moveX = (dx / distance) * speed;
    let moveY = (dy / distance) * speed;

    let newX = enemyX + moveX;
    let newY = enemyY + moveY;

    Debug.print("Updated enemy position: (" # Float.toText(newX) # ", " # Float.toText(newY) # ")");

    return {x = newX; y = newY};
  };
}
