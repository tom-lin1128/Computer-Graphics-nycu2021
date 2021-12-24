#pragma once
#include <optional>

#include "shape/shape.h"

#include <glm/glm.hpp>
#include <glm/gtc/quaternion.hpp>
#include <queue>

namespace graphics::shape {
class Cube : public Shape {
 public:
  explicit Cube(glm::vec3 position) noexcept;

  glm::vec3 getPosition() const noexcept { return glm::round(rotation * position); }
  float getPosition(Axis axis) const noexcept { return glm::round((rotation * position)[static_cast<int>(axis)]); }
  bool isIdle() const noexcept { return !now_dir.has_value(); }
  bool isIdle2() const noexcept { return rotation_progress == 0; }

  void setupModel() noexcept override;
  void draw() const noexcept override;
  CONSTEXPR_VIRTUAL const char* getTypeName() const noexcept override { return "Cube"; }

  void rotate(Axis axis, bool spin = false);

 private:
  static constexpr float scale = 2.05f;
  static int rotation_speed;
  static glm::quat base_rotation[3];
  std::queue<std::optional<int>> rotation_direction;
  std::queue<bool> spin_q;
  std::optional<int> now_dir;
  bool now_spin;
  int rotation_progress;
  glm::vec3 position;
  glm::mat4 translation;
  glm::quat rotation;
};
}  // namespace graphics::shape
