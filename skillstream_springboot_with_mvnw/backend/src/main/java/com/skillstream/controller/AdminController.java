package com.skillstream.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import com.skillstream.repository.CourseRepository;
import com.skillstream.repository.UserRepository;
import com.skillstream.model.Course;
import com.skillstream.security.JwtUtil;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final CourseRepository courseRepo;
    private final UserRepository userRepo;

    public AdminController(CourseRepository cr, UserRepository ur) {
        this.courseRepo = cr;
        this.userRepo = ur;
    }

    // Check if user is admin
    private boolean isAdmin(String authHeader) {
        String email = JwtUtil.parseSubject(authHeader);
        if (email == null) return false;
        var opt = userRepo.findByEmail(email);
        return opt.isPresent() && "ADMIN".equals(opt.get().getRole());
    }

    // Get all courses (admin only)
    @GetMapping("/courses")
    public ResponseEntity<?> getAllCourses(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("msg", "Admin access required"));
        }
        return ResponseEntity.ok(courseRepo.findAll());
    }

    // Add new course
    @PostMapping("/courses")
    public ResponseEntity<?> addCourse(@RequestHeader(value = "Authorization", required = false) String auth,
                                       @RequestBody Course course) {
        if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("msg", "Admin access required"));
        }
        
        try {
            // Validate required fields
            if (course.getCode() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("msg", "Course code is required"));
            }
            if (course.getTitle() == null || course.getTitle().isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("msg", "Course title is required"));
            }
            if (course.getDescription() == null || course.getDescription().isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("msg", "Course description is required"));
            }
            
            // Check if code already exists
            if (courseRepo.findByCode(course.getCode()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("msg", "Course code " + course.getCode() + " already exists"));
            }
            
            Course saved = courseRepo.save(course);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("msg", "Error adding course: " + e.getMessage()));
        }
    }

    // Update course
    @PutMapping("/courses/{id}")
    public ResponseEntity<?> updateCourse(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @PathVariable Long id,
                                          @RequestBody Course course) {
        if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("msg", "Admin access required"));
        }
        
        var opt = courseRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("msg", "Course not found"));
        }
        
        Course existing = opt.get();
        if (course.getTitle() != null) existing.setTitle(course.getTitle());
        if (course.getDescription() != null) existing.setDescription(course.getDescription());
        if (course.getProvider() != null) existing.setProvider(course.getProvider());
        if (course.getImage() != null) existing.setImage(course.getImage());
        if (course.getDuration() != null) existing.setDuration(course.getDuration());
        if (course.getCourseurl() != null) existing.setCourseurl(course.getCourseurl());
        if (course.getTags() != null) existing.setTags(course.getTags());
        
        Course updated = courseRepo.save(existing);
        return ResponseEntity.ok(updated);
    }

    // Delete course
    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@RequestHeader(value = "Authorization", required = false) String auth,
                                          @PathVariable Long id) {
        if (!isAdmin(auth)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("msg", "Admin access required"));
        }
        
        var opt = courseRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("msg", "Course not found"));
        }
        
        courseRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Course deleted successfully"));
    }
}
