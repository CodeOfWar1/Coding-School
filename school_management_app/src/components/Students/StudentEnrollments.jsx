import { useState } from 'react'
import { FaBook, FaCalendarCheck, FaUsers, FaCheckCircle, FaClock, FaGraduationCap, FaChalkboardTeacher, FaArrowRight, FaClipboardList, FaQuestionCircle, FaCalendarAlt } from 'react-icons/fa'

export default function StudentEnrollments({ enrollments, studentRecord, onViewCourse }) {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showCourseModal, setShowCourseModal] = useState(false)

  const handleViewCourse = (enrollment) => {
    if (onViewCourse) {
      onViewCourse(enrollment)
    } else {
      setSelectedCourse(enrollment)
      setShowCourseModal(true)
    }
  }

  if (enrollments?.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
        <FaBook className="text-5xl text-[#faa853]/40 mx-auto mb-3" />
        <p className="text-[#2d3f5d]">You're not enrolled in any courses yet.</p>
        <p className="text-gray-400 text-sm mt-2">Courses will appear here once your application is approved.</p>
      </div>
    )
  }
  
  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#2d3f5d]">My Courses</h2>
          <p className="text-gray-500 mt-1">Your enrolled courses and progress</p>
        </div>
        
        <div className="grid grid-cols-1 gap-5">
          {enrollments?.map(enrollment => (
            <div 
              key={enrollment.id} 
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#faa853]/30 transition-all cursor-pointer"
              onClick={() => handleViewCourse(enrollment)}
            >
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#faa853]/10 flex items-center justify-center">
                      <FaGraduationCap className="text-[#faa853] text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2d3f5d] text-lg">{enrollment.course?.course_name}</h3>
                      <p className="text-sm text-gray-500">{enrollment.course?.course_code}</p>
                      {enrollment.course?.teacher && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <FaChalkboardTeacher className="text-xs" />
                          Teacher: {enrollment.course.teacher}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      enrollment.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {enrollment.status === 'active' ? <FaCheckCircle className="text-xs" /> : <FaClock className="text-xs" />}
                      {enrollment.status}
                    </span>
                    <button 
                      className="px-3 py-1.5 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] text-sm flex items-center gap-1 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewCourse(enrollment)
                      }}
                    >
                      View Course <FaArrowRight className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-5 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <FaBook className="text-[#faa853] mt-0.5 text-sm" />
                    <div>
                      <p className="text-gray-500 mb-1">Course</p>
                      <p className="font-medium text-[#2d3f5d]">{enrollment.course?.course_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCalendarCheck className="text-[#faa853] mt-0.5 text-sm" />
                    <div>
                      <p className="text-gray-500 mb-1">Enrolled</p>
                      <p className="font-medium text-[#2d3f5d]">{new Date(enrollment.enrolled_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaClipboardList className="text-[#faa853] mt-0.5 text-sm" />
                    <div>
                      <p className="text-gray-500 mb-1">Assignments</p>
                      <p className="font-medium text-[#2d3f5d]">{enrollment.course?.assignments_count || 0} total</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCheckCircle className="text-[#faa853] mt-0.5 text-sm" />
                    <div>
                      <p className="text-gray-500 mb-1">Progress</p>
                      <p className="font-medium text-[#2d3f5d]">{enrollment.progress || 0}% complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Detail Modal - Overview of what's inside the course */}
      {showCourseModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCourseModal(false)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#faa853]/10 flex items-center justify-center">
                    <FaGraduationCap className="text-[#faa853] text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#2d3f5d]">{selectedCourse.course?.course_name}</h2>
                    <p className="text-sm text-gray-500">{selectedCourse.course?.course_code}</p>
                  </div>
                </div>
                <button onClick={() => setShowCourseModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaClock className="text-lg" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* Course Overview */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#2d3f5d] mb-3 flex items-center gap-2">
                  <FaBook className="text-[#faa853]" />
                  Course Overview
                </h3>
                <p className="text-gray-600">{selectedCourse.course?.description || 'No description available'}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-gray-500 text-sm">Duration</p>
                    <p className="font-medium text-[#2d3f5d]">{selectedCourse.course?.duration_weeks || 'N/A'} weeks</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Enrolled Date</p>
                    <p className="font-medium text-[#2d3f5d]">{new Date(selectedCourse.enrolled_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Course Sections/Modules */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <h3 className="font-semibold p-4 bg-gray-50 border-b flex items-center gap-2">
                  <FaClipboardList className="text-[#faa853]" />
                  Course Content
                </h3>
                <div className="divide-y">
                  {/* This would be populated from a course_modules or lessons table */}
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#2d3f5d]">Module 1: Introduction</p>
                        <p className="text-sm text-gray-500">Getting started with the basics</p>
                      </div>
                      <span className="text-xs text-gray-400">5 lessons</span>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#2d3f5d]">Module 2: Core Concepts</p>
                        <p className="text-sm text-gray-500">Understanding the fundamentals</p>
                      </div>
                      <span className="text-xs text-gray-400">8 lessons</span>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#2d3f5d]">Module 3: Advanced Topics</p>
                        <p className="text-sm text-gray-500">Deep dive into advanced concepts</p>
                      </div>
                      <span className="text-xs text-gray-400">6 lessons</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignments */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <h3 className="font-semibold p-4 bg-gray-50 border-b flex items-center gap-2">
                  <FaClipboardList className="text-[#faa853]" />
                  Assignments
                </h3>
                <div className="p-4 text-center text-gray-500">
                  <p>No assignments available yet</p>
                </div>
              </div>

              {/* Upcoming Deadlines / Calendar */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <h3 className="font-semibold p-4 bg-gray-50 border-b flex items-center gap-2">
                  <FaCalendarAlt className="text-[#faa853]" />
                  Upcoming Deadlines
                </h3>
                <div className="p-4 text-center text-gray-500">
                  <p>No upcoming deadlines</p>
                </div>
              </div>

              <button
                onClick={() => setShowCourseModal(false)}
                className="w-full py-2 border border-gray-300 text-[#2d3f5d] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}