package com.skillstream.controller;
import org.springframework.web.bind.annotation.*;
import com.skillstream.repository.FavCourseRepository;
import com.skillstream.repository.UserRepository;
import com.skillstream.repository.CourseRepository;
import com.skillstream.model.FavCourse;
import com.skillstream.model.User;
import com.skillstream.model.Course;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/favourites")
public class FavController {
    private final FavCourseRepository favRepo;
    private final UserRepository userRepo;
    private final CourseRepository courseRepo;
    public FavController(FavCourseRepository f, UserRepository u, CourseRepository c){this.favRepo=f; this.userRepo=u; this.courseRepo=c;}

    // GET favourites for the authenticated user. Prefer Authorization header; fallback to email query for compatibility
    @GetMapping("")
    public ResponseEntity<?> getFavs(@RequestHeader(value = "Authorization", required = false) String auth,
                                     @RequestParam(required = false) String email){
        if (email == null || email.isBlank()) email = com.skillstream.security.JwtUtil.parseSubject(auth);
        if (email == null || email.isBlank()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("msg","User not found"));
        var opt = userRepo.findByEmail(email);
        if(opt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("msg","User not found"));
        User u = opt.get();
        List<FavCourse> favList = favRepo.findByCreatedBy(u);
        
        // Join with Course table to get full details
        List<Course> courses = favList.stream()
            .map(fav -> courseRepo.findByCode(fav.getCode()).orElse(null))
            .filter(c -> c != null)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(courses);
    }

    @PostMapping("")
    public ResponseEntity<?> addFav(@RequestHeader(value = "Authorization", required = false) String auth,
                                    @RequestBody Map<String,Object> body){
        String email = (String)body.get("email");
        if (email == null || email.isBlank()) email = com.skillstream.security.JwtUtil.parseSubject(auth);
        Integer code = (Integer)body.get("code");
        var opt = userRepo.findByEmail(email);
        if(opt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("msg","User not found"));
        User u = opt.get();
        var exists = favRepo.findByCreatedByAndCode(u, code);
        if(exists.isPresent()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("msg","Already favourited"));
        FavCourse f = new FavCourse(); f.setCode(code); f.setCreatedBy(u);
        favRepo.save(f);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success","true","message","created"));
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<?> removeFav(@PathVariable Integer code,
                                       @RequestHeader(value = "Authorization", required = false) String auth,
                                       @RequestParam(required = false) String email){
        if (email == null || email.isBlank()) email = com.skillstream.security.JwtUtil.parseSubject(auth);
        var opt = userRepo.findByEmail(email);
        if(opt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("msg","User not found"));
        User u = opt.get();
        var exists = favRepo.findByCreatedByAndCode(u, code);
        if(exists.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("msg","Not found"));
        favRepo.delete(exists.get());
        return ResponseEntity.ok(Map.of("success","true","message","delete successful"));
    }
}