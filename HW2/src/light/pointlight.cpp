#include "light/pointlight.h"
#include <utility>
#include "graphics.h"

#include <glm/gtc/matrix_transform.hpp>

namespace graphics::light {
PointLight::PointLight(const glm::vec3& lightPosition) noexcept :
    Light(glm::vec4(lightPosition, 1), glm::vec4(0, 0, 0, 0)) {
    
  glm::mat4 viewProjection(1);
  glm::mat4 projectionMatrix = glm::mat4(1);
  constexpr float FOV = glm::radians(45.0f);
  constexpr float zNear = 0.1f;
  constexpr float zFar = 100.0f;
  projectionMatrix = glm::perspective(FOV, OpenGLContext::getAspectRatio(), zNear, zFar);
  // TODO (If you want to implement shadow): Set view projection matrix for light
  // Hint:
  //       1. You should use perspective projection for point light.
  //         same parameter as you camera
  //         glm::perspective (https://glm.g-truc.net/0.9.9/api/a00243.html#ga747c8cf99458663dd7ad1bb3a2f07787)
  //       2. You need to calculate the view matrix too
  setLightSpaceMatrix(viewProjection);
}
PointLightPTR PointLight::make_unique(const glm::vec3& lightPosition) {
  return std::make_unique<PointLight>(lightPosition);
}
}  // namespace graphics::light
