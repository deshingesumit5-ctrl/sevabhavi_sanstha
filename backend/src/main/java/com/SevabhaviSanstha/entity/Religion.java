package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "\"Religion\"")
public class Religion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"ReligionId\"")
    private Integer religionId;

    @Column(name = "\"ReligionName\"", nullable = false, length = 50)
    private String religionName;

    public Religion() {}

    public Integer getReligionId() { return religionId; }
    public void setReligionId(Integer religionId) { this.religionId = religionId; }
    public String getReligionName() { return religionName; }
    public void setReligionName(String religionName) { this.religionName = religionName; }
}