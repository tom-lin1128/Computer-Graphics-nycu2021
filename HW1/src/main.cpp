#include <algorithm>
#include <memory>
#include <vector>
#include <iostream>
#include <cstdlib>
#include <ctime>
#include <thread>
#include <chrono>

#include <GLFW/glfw3.h>
#define GLAD_GL_IMPLEMENTATION
#include <glad/gl.h>
#undef GLAD_GL_IMPLEMENTATION
#include <glm/glm.hpp>

#include "camera/quat_camera.h"
#include "context_manager.h"
#include "shape/cube.h"

int flag_r = 0;
// Unnamed namespace for global variables
namespace {
std::vector<std::unique_ptr<graphics::shape::Cube>> cubes;
}  // namespace
static int angle = 0;


void keyCallback(GLFWwindow* window, int key, int, int action, int) {
  // There are three actions: press, release, hold
  // There are three Axis: X, Y, Z
  using Axis = graphics::shape::Axis;
  if (action != GLFW_PRESS) return;
  // Press ESC to close the window.
  if (key == GLFW_KEY_ESCAPE) {
    glfwSetWindowShouldClose(window, GLFW_TRUE);
    return;
  }
  // Check all cubes are not rotating
  
  bool idle = std::all_of(cubes.begin(), cubes.end(), [](const auto& cube) { return cube->isIdle(); });
  if (!idle) return;

  // TODO: Detect key-events, perform rotation
  //       1. Use switch/case to find the key you want.
  //       2. Iterate through all cubes, perform rotation on those you want to rotate.
  // Hint:
  //       1. You can get the cube's layer by calling getPosition with Axis ( cube->getPosition(Axis::X) ),
  //          the return value can be {-1, 0, 1}, representing three layers
  //       2. You can rotate it by calling rotate with Axis ( cube->rotate(Axis::X) )
  //       3. glfw3's key list (https://www.glfw.org/docs/3.3/group__keys.html)
  // Note:
  //       You should finish your cube rendering first.
  //       Otherwise you will spend a lot of time debugging this with a black screen.
  switch (key) {
    case GLFW_KEY_X:
      for (int i = 0; i < 27; i++) {
        cubes[i]->rotate(Axis::X, true);  
      }
      break;
    case GLFW_KEY_Y:
      for (int i = 0; i < 27; i++) {
        cubes[i]->rotate(Axis::Y, true);
      }
      break;
    case GLFW_KEY_Z:
      for (int i = 0; i < 27; i++) {
        cubes[i]->rotate(Axis::Z, true);
      };
      break;
    case GLFW_KEY_1:
      for (int i = 0; i < 27; i++) {
        if (cubes[i]->getPosition(Axis::X) == -1) cubes[i]->rotate(Axis::X, true);
        else cubes[i]->rotate(Axis::X);
      }
      break;
    case GLFW_KEY_2:
      for (int i = 0; i < 27; i++) {
        if (cubes[i]->getPosition(Axis::X) == 0) cubes[i]->rotate(Axis::X, true);
        else
          cubes[i]->rotate(Axis::X);
      }
      break;
    case GLFW_KEY_3:
      for (int i = 0; i < 27; i++) {
        if (cubes[i]->getPosition(Axis::X) == 1) cubes[i]->rotate(Axis::X, true);
        else
          cubes[i]->rotate(Axis::X);
      }
      break;
    case GLFW_KEY_4:
      for (int i = 0; i < 27; i++) {
        if (cubes[i]->getPosition(Axis::Y) == -1) cubes[i]->rotate(Axis::Y, true);
        else
          cubes[i]->rotate(Axis::Y);
      }
      break;
    case GLFW_KEY_5:
      for (int i = 0; i < 27; i++) {
        if (cubes[i]->getPosition(Axis::Y) == 0) cubes[i]->rotate(Axis::Y, true);
        else
          cubes[i]->rotate(Axis::Y);
      }
      break;
    case GLFW_KEY_6:
      for (int i = 0; i < 27; i++) {
        if (cubes[i]->getPosition(Axis::Y) == 1) cubes[i]->rotate(Axis::Y, true);
        else
          cubes[i]->rotate(Axis::Y);
      }
      break;
    case GLFW_KEY_7:
      for (int i = 0; i < 27; i++) {
        if (cubes[i]->getPosition(Axis::Z) == -1) cubes[i]->rotate(Axis::Z, true);
        else
          cubes[i]->rotate(Axis::Z);
      }
      break;
    case GLFW_KEY_8:
      for (int i = 0; i < 27; i++) {
        if (cubes[i]->getPosition(Axis::Z) == 0) cubes[i]->rotate(Axis::Z, true);
        else
          cubes[i]->rotate(Axis::Z);
      }
      break;
    case GLFW_KEY_9:
      for (int i = 0; i < 27; i++) {
        if (cubes[i]->getPosition(Axis::Z) == 1) cubes[i]->rotate(Axis::Z, true);
        else
          cubes[i]->rotate(Axis::Z);
      }
      break;
    case GLFW_KEY_Q:
      for (int i = 0; i < 27; i++) {
        if (cubes[i]->getPosition(Axis::Z) == 1) cubes[i]->rotate(Axis::Z, true);
        else
          cubes[i]->rotate(Axis::Z);
      };
      for (int i = 0; i < 27; i++) {
        if (cubes[i]->getPosition(Axis::Y) == 0 && cubes[i]->getPosition(Axis::Z) == 1)
          cubes[i]->rotate(Axis::X, true);
        else if (cubes[i]->getPosition(Axis::X) == 0 && cubes[i]->getPosition(Axis::Z) != 1)
          cubes[i]->rotate(Axis::X, true);
        else
          cubes[i]->rotate(Axis::X);
      };

      break;
    case GLFW_KEY_R:
      flag_r = 1;
      break;
  }
}

void resizeCallback(GLFWwindow* window, int width, int height) {
  OpenGLContext::framebufferResizeCallback(window, width, height);
  auto ptr = static_cast<graphics::camera::Camera*>(glfwGetWindowUserPointer(window));
  if (ptr != nullptr) {
    ptr->updateProjection(OpenGLContext::getAspectRatio());
  }
}

int main() {
  // Initialize OpenGL context, details are wrapped in class.
#ifdef __APPLE__
  // MacOS need explicit request legacy support
  OpenGLContext::createContext(21, GLFW_OPENGL_ANY_PROFILE);
#else
  OpenGLContext::createContext(43, GLFW_OPENGL_COMPAT_PROFILE);
#endif
  GLFWwindow* window = OpenGLContext::getWindow();
  glfwSetWindowTitle(window, "HW1");
  glfwSetKeyCallback(window, keyCallback);
  glfwSetFramebufferSizeCallback(window, resizeCallback);
  glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
#ifndef NDEBUG
  OpenGLContext::printSystemInfo();
  // This is useful if you want to debug your OpenGL API calls.
  OpenGLContext::enableDebugCallback();
#endif
  // Setup camera.
  graphics::camera::QuaternionCamera camera(glm::vec3(0, 5, 25));
  camera.initialize(OpenGLContext::getAspectRatio());
  glfwSetWindowUserPointer(window, &camera);
  // Generate all mini-cubes
  for (int i = -1; i <= 1; ++i) {
    for (int j = -1; j <= 1; ++j) {
      for (int k = -1; k <= 1; ++k) {
        cubes.emplace_back(std::make_unique<graphics::shape::Cube>(glm::vec3(i, j, k)));
      }
    }
  }
  bool flag = true;
  // Main rendering loop
  while (!glfwWindowShouldClose(window)) {
    // Polling events.
    glfwPollEvents();
    camera.move(window);
    // GL_XXX_BIT can simply "OR" together to use.
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    // Projection Matrix
    glMatrixMode(GL_PROJECTION);
    glLoadMatrixf(camera.getProjectionMatrix());
    // ModelView Matrix
    glMatrixMode(GL_MODELVIEW);
    glLoadMatrixf(camera.getViewMatrix());

    if (flag_r == 1) {
      angle += 2;
      if (angle == 360) {
        flag_r = 0;
        angle = 0;
      }
    }
      for (int i = 0; i < 27; i++) {
        glPushMatrix();
        glRotatef(angle, 0, 1, 0);
        cubes[i]->setupModel();
        cubes[i]->draw();
        glPopMatrix();
    }
    // TODO: Render Rubik's cube
    //       1. Iterate through all cube in cubes.
    //       2. For each cube, call cube->setupModel() and cube->draw().
    //       3. You can use glPushMatrix, glPopMatrix to 'cache' the current matrix.
    // Hint:
    //       glPushMatrix/glPopMatrix   (https://www.khronos.org/registry/OpenGL-Refpages/gl2.1/xhtml/glPushMatrix.xml)
    // Note:
    //       You can implement this section using less than 10 lines of code.
#ifdef __APPLE__
    // Some platform need explicit glFlush
    glFlush();
#endif
    glfwSwapBuffers(window);
  }
  return 0;
}
