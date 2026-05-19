import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  FaSpinner, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaBook, 
  FaTimes, 
  FaMoneyBillWave,
  FaCodeBranch,
  FaClock,
  FaUserGraduate
} from 'react-icons/fa'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [enrollmentCounts, setEnrollmentCounts] = useState({})
  const [formData, setFormData] = useState({
    course_name: '', course_code: '', description: '', duration_weeks: '', tuition_fee: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('course_name')

      if (error) throw error
      setCourses(data || [])
      
      await fetchEnrollmentCounts(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollmentCounts = async (coursesData) => {
    const counts = {}
    for (const course of coursesData) {
      const { count } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id)
      counts[course.id] = count || 0
    }
    setEnrollmentCounts(counts)
  }

  const handleSaveCourse = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await supabase.from('courses').update(formData).eq('id', editingItem.id)
      } else {
        await supabase.from('courses').insert(formData)
      }
      await fetchData()
      setShowCourseModal(false)
      resetForm()
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Error saving course')
    }
  }

  const handleDelete = async (id) => {
    // Check if there are enrollments
    const { count } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', id)
    
    if (count && count > 0) {
      alert(`Cannot delete this course because ${count} student(s) are enrolled.`)
      return
    }
    
    if (!window.confirm('Are you sure you want to delete this course?')) return
    
    try {
      await supabase.from('courses').delete().eq('id', id)
      await fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error deleting course')
    }
  }

  const resetForm = () => {
    setFormData({ 
      course_name: '', course_code: '', description: '', duration_weeks: '', tuition_fee: ''
    })
    setEditingItem(null)
  }

  const openCourseModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData(item)
    } else {
      resetForm()
    }
    setShowCourseModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-[#faa853] text-3xl" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Courses Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#2d3f5d] flex items-center gap-2">
                <FaBook className="text-[#faa853]" />
                Courses
              </h2>
              <p className="text-sm text-gray-500 mt-1">Manage available courses and view enrollment counts</p>
            </div>
            <button 
              onClick={() => openCourseModal()} 
              className="px-3 py-1.5 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] transition-colors text-sm flex items-center gap-2"
            >
              <FaPlus className="text-xs" /> Add Course
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <FaBook className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No courses added yet</p>
              <button 
                onClick={() => openCourseModal()} 
                className="mt-3 text-[#faa853] text-sm hover:underline"
              >
                Create your first course
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => {
                const enrolledCount = enrollmentCounts[course.id] || 0
                return (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#faa853]/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2d3f5d]">{course.course_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <FaCodeBranch className="text-gray-400 text-xs" />
                          <span className="text-xs text-gray-500">{course.course_code}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => openCourseModal(course)} 
                          className="p-1.5 text-gray-500 hover:text-[#faa853] transition-colors rounded-lg"
                          title="Edit course"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)} 
                          className="p-1.5 text-gray-500 hover:text-red-600 transition-colors rounded-lg"
                          title="Delete course"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    {course.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{course.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <FaClock className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-500">{course.duration_weeks || 'N/A'} weeks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <FaUserGraduate className="text-[#faa853] text-xs" />
                          <span className="text-xs text-gray-600">{enrolledCount} enrolled</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaMoneyBillWave className="text-[#faa853] text-xs" />
                          <span className="text-sm font-semibold text-[#faa853]">K{course.tuition_fee}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCourseModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaBook className="text-[#faa853] text-lg" />
                <h2 className="text-lg font-semibold text-[#2d3f5d]">{editingItem ? 'Edit Course' : 'New Course'}</h2>
              </div>
              <button onClick={() => setShowCourseModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSaveCourse} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Course Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g., Web Development Fundamentals" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors" 
                  value={formData.course_name} 
                  onChange={e => setFormData({...formData, course_name: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Course Code *</label>
                <input 
                  type="text" 
                  placeholder="e.g., WD101" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors" 
                  value={formData.course_code} 
                  onChange={e => setFormData({...formData, course_code: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Description</label>
                <textarea 
                  placeholder="Course description..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors" 
                  rows={3} 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Duration (weeks)</label>
                  <input 
                    type="number" 
                    placeholder="12" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors" 
                    value={formData.duration_weeks} 
                    onChange={e => setFormData({...formData, duration_weeks: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d3f5d] mb-1">Tuition Fee (K) *</label>
                  <input 
                    type="number" 
                    placeholder="1300" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#faa853] focus:border-[#faa853] outline-none transition-colors" 
                    value={formData.tuition_fee} 
                    onChange={e => setFormData({...formData, tuition_fee: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2 bg-[#faa853] text-white rounded-lg hover:bg-[#e89235] transition-colors">
                  {editingItem ? 'Update Course' : 'Create Course'}
                </button>
                <button type="button" onClick={() => setShowCourseModal(false)} className="px-4 py-2 border border-gray-300 text-[#2d3f5d] rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}