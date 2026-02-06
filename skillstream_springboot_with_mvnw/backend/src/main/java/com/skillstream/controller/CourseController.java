package com.skillstream.controller;
import org.springframework.web.bind.annotation.*;
import com.skillstream.repository.CourseRepository;
import com.skillstream.model.Course;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {
    private final CourseRepository courseRepo;
    public CourseController(CourseRepository cr){this.courseRepo=cr;}

    @GetMapping("")
    public List<Course> getCourses(){ return courseRepo.findAll(); }

    @GetMapping("/search")
    public List<Course> search(@RequestParam("query") String q){
        String needle = (q == null ? "" : q).toLowerCase(Locale.ROOT).trim();
        return courseRepo.findAll().stream().filter(c -> {
            if (needle.isEmpty()) return true;
            if (needle.startsWith("#")) {
                String tag = needle.substring(1);
                return c.getTagsList().stream().anyMatch(t -> t.toLowerCase(Locale.ROOT).contains(tag));
            }
            return (c.getTitle()!=null && c.getTitle().toLowerCase(Locale.ROOT).contains(needle)) ||
                   (c.getDescription()!=null && c.getDescription().toLowerCase(Locale.ROOT).contains(needle)) ||
                   (c.getProvider()!=null && c.getProvider().toLowerCase(Locale.ROOT).contains(needle));
        }).collect(Collectors.toList());
    }
}