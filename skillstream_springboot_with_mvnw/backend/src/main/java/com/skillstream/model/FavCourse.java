package com.skillstream.model;

import jakarta.persistence.*;

@Entity
@Table(name = "fav_courses")
public class FavCourse {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer code;

    @ManyToOne
    @JoinColumn(name = "createdBy", referencedColumnName = "id")
    private User createdBy;

    // getters and setters
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public Integer getCode(){return code;} public void setCode(Integer code){this.code=code;}
    public User getCreatedBy(){return createdBy;} public void setCreatedBy(User u){this.createdBy=u;}
}