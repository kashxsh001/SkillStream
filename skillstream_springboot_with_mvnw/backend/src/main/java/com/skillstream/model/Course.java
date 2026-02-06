package com.skillstream.model;

import jakarta.persistence.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "courses")
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique=true)
    private Integer code;
    private String title;
    private String description;
    private String provider;
    private String image;
    private Integer duration;
    private String courseurl;
    @Column
    private String tags; // store as "Java,Spring,Backend"


    // getters and setters omitted for brevity (generate as needed)
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public Integer getCode(){return code;} public void setCode(Integer code){this.code=code;}
    public String getTitle(){return title;} public void setTitle(String t){this.title=t;}
    public String getDescription(){return description;} public void setDescription(String d){this.description=d;}
    public String getProvider(){return provider;} public void setProvider(String p){this.provider=p;}
    public String getImage(){return image;} public void setImage(String i){this.image=i;}
    public Integer getDuration(){return duration;} public void setDuration(Integer d){this.duration=d;}
    public String getCourseurl(){return courseurl;} public void setCourseurl(String url){this.courseurl=url;}
    public String getTags(){return tags;} public void setTags(String t){this.tags=t;}
    @JsonProperty("tags")
    public List<String> getTagsList() {
        if (tags == null || tags.isBlank()) return Collections.emptyList();
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    @JsonProperty("tags")
    public void setTagsList(List<String> tagList) {
        if (tagList == null) { this.tags = null; return; }
        this.tags = String.join(",", tagList);
    }
}